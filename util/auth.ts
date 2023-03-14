import { hash, genSalt, compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
// TODO: remove unused imports. Visual Studio has a command 'Organize Imports' with a key shortcut for it.
import { NextApiRequest } from 'next';
import { getSession } from 'next-auth/react';

var crypto = require('crypto');
var base64url = require('base64url');

const nodemailer = require("nodemailer");
require('dotenv').config();

// TODO: unused instance, remove it for cleaner code.
const prisma = new PrismaClient()

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

export async function verifyPassword(saltedPassword: string, hashedPassword: string) {
    const isValid = await compare(saltedPassword, hashedPassword);
    return isValid;
}

export function generateToken() {
    return base64url(crypto.randomBytes(32));
}

export function sendTokenPerMail(email: string, firstName: string, token: string, mailType: string, misc: string) {
    let transporter = nodemailer.createTransport({
        // TODO: This value must be configurable via the environment
        host: "sandbox.smtp.mailtrap.io",
        // TODO: This value must be configurable via the environment
        port: 2525,
        auth: {
            user: `${process.env.MAILTRAP_USER}`,
            pass: `${process.env.MAILTRAP_PASS}`,
        }
    });

    let baseUrl = process.env.NEXTAUTH_URL as string;

    // TODO: Move these templates to separate constants/files, e.g. multiple JSON documents.
    switch (mailType) {
        case 'VERIFY':
            transporter.sendMail({
                // TODO: This value must be configurable via the environment
                from: '"Flo Ho" <flo@onlaunch.com>',
                to: email,
                subject: 'Verify your OnLaunch account',
                // TODO: Make sure that these texts are suitable for public usage
                text: `Servas ${firstName}, please verify your OnLaunch account: <a href='${baseUrl}/verify?token=${token}'>verify now</a>`,
                html: `Servas <b>${firstName}</b>,<br/><br/>please verify your OnLaunch account:<br/><br/>link: <a href='${baseUrl}/verify?token=${token}'>verify now</a><br/>Your link expires in 7 days<br/><br/>Flo von OnLaunch`,
            });
            break;

            case 'RESET_PASSWORD':
                transporter.sendMail({
                    // TODO: This value must be configurable via the environment
                    from: '"Flo Ho" <flo@onlaunch.com>',
                    to: email,
                    subject: 'Reset your OnLaunch password',
                    // TODO: Make sure that these texts are suitable for public usage
                    text: `Servas ${firstName}, use this link to change your password within the next hour: <a href='${baseUrl}/resetPassword?token=${token}'>reset now</a>`,
                    html: `Servas <b>${firstName}</b>,<br/><br/>use this link to change your password within the next hour:<br/><br/>link: <a href='${baseUrl}/resetPassword?token=${token}'>reset now</a><br/>If you haven't requested a password reset, please contact our support service<br/><br/>Flo von OnLaunch`,
                });
                break;

            case 'CHANGE_EMAIL':
                transporter.sendMail({
                    // TODO: This value must be configurable via the environment
                    from: '"Flo Ho" <flo@onlaunch.com>',
                    to: email,
                    subject: 'Verify your new OnLaunch email address',
                    // TODO: Make sure that these texts are suitable for public usage
                    text: `Servas ${firstName}, use this link to verify your new email address within the next hour: <a href='${baseUrl}/resetPassword?token=${token}'>verify now</a>`,
                    html: `Servas <b>${firstName}</b>,<br/><br/>use this link to verify your new email address within the next hour:<br/><br/>link: <a href='${baseUrl}/changeEmail?token=${token}'>verify now</a><br/>If you haven't requested this email change, please contact our support service<br/><br/>Flo von OnLaunch`,
                });
                break;

            case 'MAIL_CHANGED':
                transporter.sendMail({
                    // TODO: This value must be configurable via the environment
                    from: '"Flo Ho" <flo@onlaunch.com>',
                    to: email,
                    subject: 'Your email address has been changed',
                    // TODO: Make sure that these texts are suitable for public usage
                    text: `Servas ${firstName}, we just wanted to inform you that this is no longer your current email address for OnLaunch, because it was changed`,
                    html: `Servas <b>${firstName}</b>,<br/><br/>we just wanted to inform you that this is no longer your current email address for OnLaunch, because it was changed<br/>If you haven't requested this email change, please contact our support service<br/><br/>Flo von OnLaunch`,
                });
                break;

            case 'DIRECT_INVITE':
                transporter.sendMail({
                    // TODO: This value must be configurable via the environment
                    from: '"Flo Ho" <flo@onlaunch.com>',
                    to: email,
                    subject: 'You have a new invitation',
                    // TODO: Make sure that these texts are suitable for public usage
                    text: `Servas ${firstName}, you are now invited to an organisation`,
                    html: `Servas <b>${firstName}</b>,<br/><br/>you are invited to join an organisation<br/><br/>use this link to show and join within the next hour:<br/><br/>link: <a href='${baseUrl}/dashboard?directinvite=${token}'>join now</a><br/><br/>Flo von OnLaunch`,
                });
                break;
    }
    
}