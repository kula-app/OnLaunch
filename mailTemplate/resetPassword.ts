import { Template } from "../models/template";

export function createResetPasswordTemplate(firstName: string, urlWithToken: string, senderName: string): Template {
    return {
      subject: 'Reset your OnLaunch password',
      text: `Dear ${firstName}, use this link to change your password within the next hour: <a href='${urlWithToken}'>reset now</a>`,
      html: `Dear <b>${firstName}</b>,<br/><br/>use this link to change your password within the next hour:<br/><br/>link: <a href='${urlWithToken}'>reset now</a><br/>If you haven't requested a password reset, please contact our support service<br/><br/>${senderName} von OnLaunch`,
    };
  }