import Errors, { HttpCode, Message } from "../libs/Errors";
import { View, ViewInput } from "../libs/types/view";
import ViewModel from "../schema/View.model";

class ViewService {
  private readonly viewModel;

  constructor() {
    this.viewModel = ViewModel;
  }

  public async checkViewExistence(input: ViewInput): Promise<View | null> {
    const result = await this.viewModel
      .findOne({ memberId: input.memberId, viewRefId: input.viewRefId })
      .exec();

    return result ? (result.toObject() as View) : null;
  }

  public async insertMemberView(input: ViewInput): Promise<View | null> {
    try {
      const result = await this.viewModel.create(input);
      return result ? (result.toObject() as View) : null;
    } catch (err) {
      console.log("ERROR, model:insertViewMember:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
}

export default ViewService;
