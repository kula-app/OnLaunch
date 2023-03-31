import { Template } from "../types/template";

export function createResetPasswordTemplate(firstName: string, baseUrl: string, token: string, senderName: string): Template {
    return {
      subject: 'Reset your OnLaunch password',
      text: `Dear ${firstName}, use this link to change your password within the next hour: <a href='${baseUrl}/resetPassword?token=${token}'>reset now</a>`,
      html: `Dear <b>${firstName}</b>,<br/><br/>use this link to change your password within the next hour:<br/><br/>link: <a href='${baseUrl}/resetPassword?token=${token}'>reset now</a><br/>If you haven't requested a password reset, please contact our support service<br/><br/>${senderName} von OnLaunch`,
    };
  }