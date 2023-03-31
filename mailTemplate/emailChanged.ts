import { Template } from "../models/template";

export function createEmailChangedTemplate(
  firstName: string,
  senderName: string
): Template {
  return {
    subject: "Your email address has been changed",
    text: `Dear ${firstName}, we just wanted to inform you that this is no longer your current email address for OnLaunch, because it was changed`,
    html: `Dear <b>${firstName}</b>,<br/><br/>we just wanted to inform you that this is no longer your current email address for OnLaunch, because it was changed<br/>If you haven't requested this email change, please contact our support service<br/><br/>${senderName} von OnLaunch`,
  };
}
