import { Template } from "../models/template";

export function createDirectInviteNewUserTemplate(
  urlWithToken: string,
  senderName: string,
): Template {
  return {
    subject: "You have a new invitation",
    text: `Dear future OnLaunch user, you are now invited to an organisation: <a href='${urlWithToken}'>join now</a>`,
    html: `Dear future OnLaunch user,<br/><br/>you are invited to join an organisation<br/><br/>sign up to OnLaunch and then use this link to show and join within the next hour:<br/><br/>link: <a href='${urlWithToken}'>join now</a><br/><br/>${senderName} von OnLaunch`,
  };
}
