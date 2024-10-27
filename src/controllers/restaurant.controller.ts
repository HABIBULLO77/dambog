import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";

const memberService = new MemberService();

const restaurantController: T = {};
restaurantController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome");
    res.render("home");
  } catch (err) {
    console.log("Error, goHome:", err);
    res.redirect("/admin");
  }
};

restaurantController.getSignup = (req: Request, res: Response) => {
  try {
    console.log("getSignup");
    res.render("signup");
  } catch (err) {
    console.log("Error, getSignup:", err);
    res.redirect("/admin");
  }
};

restaurantController.getLogin = (req: Request, res: Response) => {
  try {
    console.log("getLogin");
    res.render("login");
  } catch (err) {
    console.log("Error, getLogin:", err);
    res.redirect("/admin");
  }
};

restaurantController.processSignup = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("processSignup");
    const file = req.file;
    if (!file)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    const newMember: MemberInput = req.body;
    newMember.memberImage = file?.path.replace(/\\/g, "/");
    newMember.memberType = MemberType.RESTAURANT;
    

    

    const result = await memberService.processSignup(newMember);
    

    req.session.member = result;
    req.session.save(function () {
      res.redirect("/admin/product/all");
    });
  } catch (err) {
    console.log("Error, processSignup:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace("/admin/signup")</script>`
    );
  }
};

restaurantController.sendVerificationCode = async (
  req: AdminRequest,
  res: Response
) => {
  const { email } = req.body;
  console.log("Email:", email);

  try {
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    req.session.verificationCode = verificationCode;
    req.session.verificationEmail = email;
    req.session.verificationExpires = Date.now() + 10 * 60 * 1000;
    await memberService.sendVerificationCodeEmail(email, verificationCode);
    res.status(200).json({ message: "Verification code sent successfully." });
  } catch (error) {
    console.error("Error sending verification code:", error);
    res.status(500).json({ message: "Failed to send verification code." });
  }
};

restaurantController.verifyEmailCode = async (
  req: AdminRequest,
  res: Response
) => {
  //const { memberEmail, verificationCode } = req.body;
  const { verificationCode, verificationExpires } = req.session;
  const userCode = req.body.verificationCode;
  console.log("userCode", userCode)
  const nowDate = Date.now();
  if (!verificationCode || nowDate > (verificationExpires ?? 0)) {
    // Code is missing or expired
    req.session.verificationCode = null; // Clear expired code
    req.session.verificationExpires = null;
    return false;
  }

  try {
    const isValid = verificationCode === userCode;

    if (isValid) {
      req.session.verificationCode = null;
      req.session.verificationExpires = null;
      res.status(200).json({ message: "Email verified successfully!" });
    } else {
      res
        .status(400)
        .json({ message: "Invalid or expired verification code." });
    }
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
};

restaurantController.resendCode = async (req: AdminRequest, res: Response) => {
  const { email } = req.body;

  try {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    await memberService.storeVerificationCode(email, newCode);
    await memberService.sendVerificationCodeEmail(email, newCode);

    res.status(200).json({
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Error resending code:", error);
    res.status(500).json({ message: "Failed to resend verification code." });
  }
};

restaurantController.processLogin = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("processLogin");
    const input: LoginInput = req.body;

    const result = await memberService.processLogin(input);
    req.session.member = result;
    req.session.save(function () {
      res.redirect("/admin/product/all");
    });
  } catch (err) {
    console.log("Error, processLogin:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace("/admin/login")</script>`
    );
  }
};

restaurantController.logout = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processLogin");
    req.session.destroy(function () {
      res.redirect("/admin");
    });
  } catch (err) {
    console.log("Error, logout:", err);
    res.redirect("/admin");
  }
};

restaurantController.getUsers = async (req: Request, res: Response) => {
  try {
    console.log("getUsers");
    const result = await memberService.getUsers();
    res.render("users", { users: result });
  } catch (err) {
    console.log("Error, getUsers:", err);
    res.redirect("/admin/login");
  }
};

restaurantController.updateChosenUser = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenUser");
    const result = await memberService.updateChosenUser(req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenUser:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

restaurantController.checkAuthSession = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("checkAuthSession");
    if (req.session?.member)
      res.send(`<script> alert("${req.session.member.memberNick}")</script> `);
    else res.send(`<script> alert("${Message.NOT_AUTHENTICATED}")</script>`);
  } catch (err) {
    console.log("Error, checkAuthSession:", err);
    res.send(err);
  }
};

restaurantController.verifyRestaurant = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("verifyRestaurant");
  if (req.session?.member?.memberType === MemberType.RESTAURANT) {
    req.member = req.session.member;
    next();
  } else {
    const message = Message.NOT_AUTHENTICATED;
    res.send(
      `<script>alert("${message}"); window.location.replace('/admin/login')</script>`
    );
  }
};

export default restaurantController;
