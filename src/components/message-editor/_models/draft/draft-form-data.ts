import type { MessageActionButtonDesign } from "@/models/message-action-button-design";
import type { MessageActionLinkTarget } from "@/models/message-action-link-target";
import type { MessageActionType } from "@/models/message-action-type";

export interface DraftFormData {
  title: string;
  body: string;
  isBlocking: boolean;
  actions: DraftFormActionData[];
}

export interface DraftFormActionData {
  id: number;
  actionType: MessageActionType;
  buttonDesign: MessageActionButtonDesign;
  title: string;
  link: DraftFormActionLinkData;
}

export interface DraftFormActionLinkData {
  link?: string;
  target?: MessageActionLinkTarget;
}
