import MemberModel from "../schema/Member.model";
import {
  LoginInput,
  Member,
  MemberInput,
  MemberUpdateInput,
} from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import * as bcrypt from "bcryptjs";
import { HydratedDocument } from "mongoose";
import { shapeIntoMongooseObjectId } from "../libs/config";
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import axios from "axios";
import { MailtrapTransport } from "mailtrap";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
class MemberService {
  private readonly memberModel;
  constructor() {
    this.memberModel = MemberModel;
  }

  /** SPA */

  public async getRestaurant(): Promise<Member> {
    const result = await this.memberModel
      .findOne({ memberType: MemberType.RESTAURANT })
      .lean()
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return {
      ...result,
      _id: result._id.toString(), // Convert ObjectId to string
    } as Member;
  }

  public async signup(input: MemberInput): Promise<Member> {
    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";
      return result.toJSON() as Member;
    } catch (err) {
      console.error("Error, model: signup", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
    }
  }

  public async login(input: LoginInput): Promise<Member> {
    // TODO consider member status later
    const member = await this.memberModel
      .findOne(
        { memberNick: input.memberNick },
        { memberNick: 1, memberPassword: 1 }
      )
      .exec();

    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);

    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );
    //const isMatch = input.memberPassword === member.memberPassword;
    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }
    const result = await this.memberModel.findById(member._id).lean().exec();
    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return {
      ...result,
      _id: result._id.toString(), // Convert ObjectId to string
    } as Member;
  }

  public async getMemberDetail(member: Member): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const result = await this.memberModel
      .findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return {
      ...result,
      _id: result._id.toString(), // Convert ObjectId to string
    } as Member;
  }

  public async updateMember(
    member: Member,
    input: MemberUpdateInput
  ): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const result = await this.memberModel
      .findOneAndUpdate({ _id: memberId }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return {
      ...result,
      _id: result._id.toString(), // Convert ObjectId to string
    } as Member;
  }

  public async getTopUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({
        memberStatus: MemberStatus.ACTIVE,
        memberPoints: { $gte: 1 },
      })
      .sort({ memberPoints: -1 })
      .limit(4)
      .exec();
    if (!result.length)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result as unknown as Member[];
    // return result.map((member) => ({
    //   ...member,
    //   _id: member._id.toString(), // Convert ObjectId to string

    // })) as Member[];
  }

  public async addUserPoint(member: Member, point: number): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id); // Ensure _id is ObjectId

    const result = await this.memberModel
      .findOneAndUpdate(
        {
          _id: memberId,
          memberType: MemberType.USER,
          memberStatus: MemberStatus.ACTIVE,
        },
        { $inc: { memberPoints: point } },
        { new: true }
      )
      .lean() // Use lean to return a plain object
      .exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    }

    // Convert _id from ObjectId to string before returning
    return {
      ...result,
      _id: result._id.toString(), // Convert ObjectId to string
    } as Member;
  }

  /** SSR */

  public async processSignup(input: MemberInput): Promise<Member> {
    const exist = await this.memberModel
      .findOne({ memberType: MemberType.RESTAURANT })
      .exec(); // query ni execute qiladi ya'ni bundan oldingi methodga boshqa method ula olmaydigan qiladi

    if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";
      return result?.toObject();
    } catch (err) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async verifyCode(email: string, code: string): Promise<boolean> {
    const user = await this.memberModel.findOne({ email }).exec();

    if (!user || user.verificationCode !== code) {
      return false; // Invalid code
    }

    // Check if codeExpiry exists and is not expired
    if (!user.codeExpiry || Date.now() > user.codeExpiry.getTime()) {
      // Clear the verification code and expiry in the database
      await this.memberModel.updateOne(
        { email },
        { $unset: { verificationCode: "", codeExpiry: "" } }
      );
      return false; // Code expired
    }

    // If code is valid, mark the user as verified
    await this.memberModel.updateOne(
      { email },
      { isVerified: true, $unset: { verificationCode: "", codeExpiry: "" } }
    );

    return true;
  }

  public async processLogin(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        { memberNick: input.memberNick },
        { memberNick: 1, memberPassword: 1 }
      )
      .exec();

    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);

    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );
    //const isMatch = input.memberPassword === member.memberPassword;
    if (!isMatch)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    const result = await this.memberModel.findById(member._id).exec();
    return result?.toObject() as Member;
  }

  public async getUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({ memberType: MemberType.USER })
      .exec();
    if (!result.length)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result.map((member) => ({
      ...member,
      _id: member._id.toString(), // Convert ObjectId to string
    })) as Member[];
  }

  public async updateChosenUser(input: MemberUpdateInput): Promise<Member> {
    input._id = shapeIntoMongooseObjectId(input._id);
    const result = await this.memberModel
      .findByIdAndUpdate({ _id: input._id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return {
      ...result,
      _id: result._id.toString(), // Convert ObjectId to string
    } as Member;
  }

  // Helper function to send the verification code email
  public async sendVerificationCodeEmail(email: string, code: string) {
    console.log("Recipient Email:", email);

    const TOKEN = "c2ac73cdc1d9ddf762e3ef4a9178ac41";
    const transport = nodemailer.createTransport(
      MailtrapTransport({
        token: TOKEN,
      })
    );

    const sender = {
      address: "hello@demomailtrap.com",
      name: "Mailtrap Test",
    };
    const recipients = ["h.hamidov77777@gmail.com"];

    try {
      const result = transport.sendMail({
        from: sender,
        to: recipients,
        subject: "Your Verification Code",
        html: `<p>Please use the following code to verify your email:</p>
             <h2>${code}</h2>
             <p>This code will expire in 10 minutes.</p>`,
      });
      console.log("Verification email sent:", result);
      return result;
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email.");
    }
  }

  public async storeVerificationCode(email: string, code: string) {
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    await this.memberModel.updateOne(
      { email },
      { verificationCode: code, codeExpiry: expiry }
    );
  }
}

export default MemberService;
