import type { ActionButtonDesign } from "./action-button-design";
import type { MessageActionType } from "./message-action-type";

export interface MessageAction {
  id: number;
  actionType: MessageActionType;
  buttonDesign: ActionButtonDesign;
  title: string;

  link?: string;
}
