import { ActionButtonDesign } from "@/models/action-button-design";
import { MessageActionType } from "@/models/message-action-type";

export function displayNameForActionType(type: MessageActionType): string {
  switch (type) {
    case MessageActionType.DISMISS:
      return "Dismiss";
    default:
      return "Unknown";
  }
}

export function displayNameForActionButtonDesign(
  design: ActionButtonDesign,
): string {
  switch (design) {
    case ActionButtonDesign.FILLED:
      return "Filled";
    case ActionButtonDesign.OUTLINE:
      return "Outline";
    default:
      return "Unknown";
  }
}
