import { compare, genSalt, hash } from 'bcrypt';
import config from '../config/config';
import { createChangeEmailTemplate } from '../mailTemplate/changeEmail';
import { createDirectInviteTemplate } from '../mailTemplate/directInvite';
import { createEmailChangedTemplate } from '../mailTemplate/emailChanged';
import { createResetPasswordTemplate } from '../mailTemplate/resetPassword';
import { createVerificationTemplate } from '../mailTemplate/verification';
import { MailType } from '../models/mailType';
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
        host: `${config.smtp.host}`,
        port: config.smtp.port,
        auth: {
            // must be wrapped in a string, so it is never undefined
            user: `${config.smtp.user}`,
            pass: `${config.smtp.pass}`,
        }
    });

    let baseUrl = config.nextAuth.url as string;
    const senderName = config.emailContent.senderName as string;

    switch (mailType) {
        case MailType.Verification:
            const verificationTemplate = createVerificationTemplate(firstName, baseUrl, token, senderName);

            transporter.sendMail({
                from: getSenderData(senderName),
                to: email,
                subject: verificationTemplate.subject,
                text: verificationTemplate.text,
                html: verificationTemplate.html,
            });
            break;

        case MailType.ResetPassword:
            const resetPasswordTemplate = createResetPasswordTemplate(firstName, baseUrl, token, senderName);

            transporter.sendMail({
                from: getSenderData(senderName),
                to: email,
                subject: resetPasswordTemplate.subject,
                text: resetPasswordTemplate.text,
                html: resetPasswordTemplate.html,
            });
            break;

        case MailType.ChangeEmail:
            const changeEmailTemplate = createChangeEmailTemplate(firstName, baseUrl, token, senderName);

            transporter.sendMail({
                from: getSenderData(senderName),
                to: email,
                subject: changeEmailTemplate.subject,
                text: changeEmailTemplate.text,
                html: changeEmailTemplate.html,
            });
            break;

        case MailType.EmailChanged:
            const emailChangedTemplate = createEmailChangedTemplate(firstName, senderName);

            transporter.sendMail({
                from: getSenderData(senderName),
                to: email,
                subject: emailChangedTemplate.subject,
                text: emailChangedTemplate.text,
                html: emailChangedTemplate.html,
            });
            break;

        case MailType.DirectInvite:
            const directInviteTemplate = createDirectInviteTemplate(firstName, baseUrl, token, senderName);

            transporter.sendMail({
                from: getSenderData(senderName),
                to: email,
                subject: directInviteTemplate.subject,
                text: directInviteTemplate.text,
                html: directInviteTemplate.html,
            });
            break;
    }

    function getSenderData(senderName: string) {
        return `"${senderName}" <${config.emailContent.senderAddress}>`;
    }
}