import { Template } from "../types/template";

export function createDirectInviteTemplate(firstName: string, baseUrl: string, token: string, senderName: string): Template {
    return {
      subject: 'You have a new invitation',
      text: `Dear ${firstName}, you are now invited to an organisation`,
      html: `Dear <b>${firstName}</b>,<br/><br/>you are invited to join an organisation<br/><br/>use this link to show and join within the next hour:<br/><br/>link: <a href='${baseUrl}/dashboard?directinvite=${token}'>join now</a><br/><br/>${senderName} von OnLaunch`,
    };
  }