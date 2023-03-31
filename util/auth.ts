import { compare, genSalt, hash } from 'bcrypt';
import { MailType } from '../types/mailType';
var crypto = require('crypto');
var base64url = require('base64url');

const nodemailer = require("nodemailer");
require('dotenv').config();

export async function hashAndSaltPassword(password: string) {
    const saltRounds = 10;
    
    const salt = await genSalt(saltRounds);
    const hashedSaltedPassword = await hash(password.concat(salt), 12);

    return { 
        salt: salt,
        hashedSaltedPassword: hashedSaltedPassword,
    }
}

export async function validatePassword(password: string) {
    return password && password.trim().length >= 8;
}

export async function verifyPassword(password: string, salt: string, hashedPassword: string) {
    const isValid = await compare(password.concat(salt), hashedPassword);
    return isValid;
}

export function generateToken() {
    return base64url(crypto.randomBytes(32));
}

export function sendTokenPerMail(email: string, firstName: string, token: string, mailType: MailType) {
    let transporter = nodemailer.createTransport({
        host: `${process.env.SMTP_HOST}`,
        port: Number(process.env.SMTP_PORT),
        auth: {
            user: `${process.env.SMTP_USER}`,
            pass: `${process.env.SMTP_PASS}`,
        }
    });

    let baseUrl = process.env.NEXTAUTH_URL as string;

    // TODO: Move these templates to separate constants/files, e.g. multiple JSON documents.
    switch (mailType) {
        case MailType.Verification:
            transporter.sendMail({
                from: getSenderData(),
                to: email,
                subject: 'Verify your OnLaunch account',
                text: `Dear ${firstName}, please verify your OnLaunch account: <a href='${baseUrl}/verify?token=${token}'>verify now</a>`,
                html: `Dear <b>${firstName}</b>,<br/><br/>please verify your OnLaunch account:<br/><br/>link: <a href='${baseUrl}/verify?token=${token}'>verify now</a><br/>Your link expires in 7 days<br/><br/>Flo von OnLaunch`,
            });
            break;

        case MailType.ResetPassword:
            transporter.sendMail({
                from: getSenderData(),
                to: email,
                subject: 'Reset your OnLaunch password',
                text: `Dear ${firstName}, use this link to change your password within the next hour: <a href='${baseUrl}/resetPassword?token=${token}'>reset now</a>`,
                html: `Dear <b>${firstName}</b>,<br/><br/>use this link to change your password within the next hour:<br/><br/>link: <a href='${baseUrl}/resetPassword?token=${token}'>reset now</a><br/>If you haven't requested a password reset, please contact our support service<br/><br/>Flo von OnLaunch`,
            });
            break;

        case MailType.ChangeEmail:
            transporter.sendMail({
                from: getSenderData(),
                to: email,
                subject: 'Verify your new OnLaunch email address',
                text: `Dear ${firstName}, use this link to verify your new email address within the next hour: <a href='${baseUrl}/resetPassword?token=${token}'>verify now</a>`,
                html: `Dear <b>${firstName}</b>,<br/><br/>use this link to verify your new email address within the next hour:<br/><br/>link: <a href='${baseUrl}/changeEmail?token=${token}'>verify now</a><br/>If you haven't requested this email change, please contact our support service<br/><br/>Flo von OnLaunch`,
            });
            break;

        case MailType.EmailChanged:
            transporter.sendMail({
                from: getSenderData(),
                to: email,
                subject: 'Your email address has been changed',
                text: `Dear ${firstName}, we just wanted to inform you that this is no longer your current email address for OnLaunch, because it was changed`,
                html: `Dear <b>${firstName}</b>,<br/><br/>we just wanted to inform you that this is no longer your current email address for OnLaunch, because it was changed<br/>If you haven't requested this email change, please contact our support service<br/><br/>Flo von OnLaunch`,
            });
            break;

        case MailType.DirectInvite:
            transporter.sendMail({
                from: getSenderData(),
                to: email,
                subject: 'You have a new invitation',
                text: `Dear ${firstName}, you are now invited to an organisation`,
                html: `Dear <b>${firstName}</b>,<br/><br/>you are invited to join an organisation<br/><br/>use this link to show and join within the next hour:<br/><br/>link: <a href='${baseUrl}/dashboard?directinvite=${token}'>join now</a><br/><br/>Flo von OnLaunch`,
            });
            break;
    }

    function getSenderData() {
        return `"${process.env.SENDING_NAME}" <${process.env.SENDING_EMAIL_ADDRESS}>`;
    }
}