import { ActionButtonDesign } from "@/models/action-button-design";
import { MessageActionType } from "@/models/message-action-type";
import { OrgRole } from "@/models/org-role";

export function displayNameForActionType(type: MessageActionType): string {
  switch (type) {
    case MessageActionType.DISMISS:
      return "Dismiss";
    case MessageActionType.OPEN_APP_IN_APP_STORE:
      return "Open App Store Page";
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

export function displayNameForOrgRole(role: OrgRole): string {
  switch (role) {
    case OrgRole.ADMIN:
      return "Admin";
    case OrgRole.USER:
      return "User";
    default:
      return "Unknown";
  }
}
