import { Template } from "../types/template";

export function createChangeEmailTemplate(firstName: string, baseUrl: string, token: string, senderName: string): Template {
    return {
      subject: 'Verify your new OnLaunch email address',
      text: `Dear ${firstName}, use this link to verify your new email address within the next hour: <a href='${baseUrl}/resetPassword?token=${token}'>verify now</a>`,
      html: `Dear <b>${firstName}</b>,<br/><br/>use this link to verify your new email address within the next hour:<br/><br/>link: <a href='${baseUrl}/changeEmail?token=${token}'>verify now</a><br/>If you haven't requested this email change, please contact our support service<br/><br/>${senderName} von OnLaunch`,
    };
  }