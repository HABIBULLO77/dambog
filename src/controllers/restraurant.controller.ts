import { Request, Response } from "express";
import { T } from "../libs/types/common";
import { MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import MemberService from "../models/Member.service";

const restaurantController: T = {};

restaurantController.processSignup = async (req: Request, res: Response) => {
  try {
    console.log("processSignup");
    const newMember: MemberInput = req.body;
    newMember.memberType = MemberType.RESTAURANT;

    const memberService = new MemberService();
    const result = await memberService.processSignup(newMember);
    res.send(result);
  } catch (err) {
    console.log("Error, processSignup:", err);
  }
};

restaurantController.processLogin = async (req: Request, res: Response) => {
  try {
    console.log("processLogin");
    res.send("DONE");
  } catch (err) {
    console.log("Error, processLogin:", err);
  }
};

export default restaurantController;
