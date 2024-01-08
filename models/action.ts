import { ActionType } from "./actionType";
import { ButtonDesign } from "./buttonDesign";

export type Action = {
  id?: number;
  actionType: ActionType;
  buttonDesign: ButtonDesign;
  title: string;
  messageId?: number;
};
