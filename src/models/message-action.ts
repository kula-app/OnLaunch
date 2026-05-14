import type { MessageActionButtonDesign } from "./message-action-button-design";
import type { MessageActionLink } from "./message-action-link";
import type { MessageActionType } from "./message-action-type";

export interface MessageAction {
  id: number;

  title: string;

  actionType: MessageActionType;
  buttonDesign: MessageActionButtonDesign;

  link: MessageActionLink | undefined;
}
