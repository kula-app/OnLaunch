import { Template } from "../models/template";

export function createVerificationTemplate(firstName: string, baseUrl: string, token: string, senderName: string): Template {
    return {
      subject: 'Verify your OnLaunch account',
      text: `Dear ${firstName}, please verify your OnLaunch account: <a href='${baseUrl}/verify?token=${token}'>verify now</a>`,
      html: `Dear <b>${firstName}</b>,<br/><br/>please verify your OnLaunch account:<br/><br/>link: <a href='${baseUrl}/verify?token=${token}'>verify now</a><br/>Your link expires in 7 days<br/><br/>${senderName} von OnLaunch`,
    };
  }