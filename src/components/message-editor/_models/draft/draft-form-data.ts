import type { ActionButtonDesign } from "@/models/action-button-design";
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
  buttonDesign: ActionButtonDesign;
  title: string;
}
