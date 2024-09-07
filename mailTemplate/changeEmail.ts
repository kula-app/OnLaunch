import { Template } from "../models/template";

export function createChangeEmailTemplate(
  firstName: string | null,
  urlWithToken: string,
  senderName: string
): Template {
  return {
    subject: "Verify your new OnLaunch email address",
    text: `Dear ${firstName}, use this link to verify your new email address within the next hour: <a href='${urlWithToken}'>verify now</a>`,
    html: `Dear <b>${firstName}</b>,<br/><br/>use this link to verify your new email address within the next hour:<br/><br/>link: <a href='${urlWithToken}'>verify now</a><br/>If you haven't requested this email change, please contact our support service<br/><br/>${senderName} von OnLaunch`,
  };
}
