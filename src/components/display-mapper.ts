import { MessageActionButtonDesign } from "@/models/message-action-button-design";
import { MessageActionLinkTarget } from "@/models/message-action-link-target";
import { MessageActionType } from "@/models/message-action-type";
import { OrgRole } from "@/models/org-role";

export function displayNameForActionType(type: MessageActionType): string {
  switch (type) {
    case MessageActionType.DISMISS:
      return "Dismiss";
    case MessageActionType.OPEN_LINK:
      return "Open Link";
    default:
      return "Unknown";
  }
}

export function displayNameForActionButtonDesign(
  design: MessageActionButtonDesign,
): string {
  switch (design) {
    case MessageActionButtonDesign.FILLED:
      return "Filled";
    case MessageActionButtonDesign.OUTLINE:
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

export function displayNameForMessageActionLinkTarget(
  target: MessageActionLinkTarget,
): string {
  switch (target) {
    case MessageActionLinkTarget.IN_APP_BROWSER:
      return "Open In App";
    case MessageActionLinkTarget.SHARE_SHEET:
      return "Share Sheet";
    case MessageActionLinkTarget.SYSTEM_BROWSER:
      return "Open In Browser";
    default:
      return "Unknown";
  }
}
