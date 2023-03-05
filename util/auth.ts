import { hash, genSalt, compare } from 'bcrypt';
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

export async function verifyPassword(saltedPassword: string, hashedPassword: string) {
    const isValid = await compare(saltedPassword, hashedPassword);
    return isValid;
}

export function generateToken() {
    return base64url(crypto.randomBytes(32));
}

export function sendTokenPerMail(email: string, firstName: string, token: string, mailType: string) {
    let transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: `${process.env.MAILTRAP_USER}`,
            pass: `${process.env.MAILTRAP_PASS}`,
        }
    });

    switch (mailType) {
        case 'VERIFY':
            transporter.sendMail({
                from: '"Flo Ho" <flo@onlaunch.com>',
                to: email,
                subject: 'Verify your OnLaunch account',
                text: `Servas ${firstName}, please verify your OnLaunch account: <a href='localhost:3000/verify?token=${token}'>verify now</a>`,
                html: `Servas <b>${firstName}</b>,<br/><br/>please verify your OnLaunch account:<br/><br/>link: <a href='localhost:3000/verify?token=${token}'>verify now</a><br/>Your link expires in 7 days<br/><br/>Flo von OnLaunch`,
            });
            break;

            case 'RESET_PASSWORD':
                transporter.sendMail({
                    from: '"Flo Ho" <flo@onlaunch.com>',
                    to: email,
                    subject: 'Reset your OnLaunch password',
                    text: `Servas ${firstName}, use this link to change your password within the next hour: <a href='localhost:3000/resetPassword?token=${token}'>reset now</a>`,
                    html: `Servas <b>${firstName}</b>,<br/><br/>use this link to change your password within the next hour:<br/><br/>link: <a href='localhost:3000/resetPassword?token=${token}'>reset now</a><br/>If you haven't requested a password reset, please contact our support service<br/><br/>Flo von OnLaunch`,
                });
                break;

                case 'CHANGE_EMAIL':
                    transporter.sendMail({
                        from: '"Flo Ho" <flo@onlaunch.com>',
                        to: email,
                        subject: 'Verify your new OnLaunch email address',
                        text: `Servas ${firstName}, use this link to verify your new email address within the next hour: <a href='localhost:3000/resetPassword?token=${token}'>verify now</a>`,
                        html: `Servas <b>${firstName}</b>,<br/><br/>use this link to verify your new email address within the next hour:<br/><br/>link: <a href='localhost:3000/changeEmail?token=${token}'>verify now</a><br/>If you haven't requested this email change, please contact our support service<br/><br/>Flo von OnLaunch`,
                    });
                    break;

                case 'MAIL_CHANGED':
                    transporter.sendMail({
                        from: '"Flo Ho" <flo@onlaunch.com>',
                        to: email,
                        subject: 'Your email address has been changed',
                        text: `Servas ${firstName}, we just wanted to inform you that this is no longer your current email address for OnLaunch, because it was changed`,
                        html: `Servas <b>${firstName}</b>,<br/><br/>we just wanted to inform you that this is no longer your current email address for OnLaunch, because it was changed<br/>If you haven't requested this email change, please contact our support service<br/><br/>Flo von OnLaunch`,
                    });
                    break;
    }
    
}