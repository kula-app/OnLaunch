import { Template } from "../models/template";

export function createVerificationTemplate(
  firstName: string | null,
  urlWithToken: string,
  senderName: string,
): Template {
  return {
    subject: "Verify your OnLaunch account",
    text: `Dear ${firstName}, please verify your OnLaunch account: <a href='${urlWithToken}'>verify now</a>`,
    html: `Dear <b>${firstName}</b>,<br/><br/>please verify your OnLaunch account:<br/><br/>link: <a href='${urlWithToken}'>verify now</a><br/>Your link expires in 7 days<br/><br/>${senderName} von OnLaunch`,
  };
}
