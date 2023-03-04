// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashAndSaltPassword, validatePassword } from '../../../../util/auth';
import { generateToken } from '../../../../util/auth';

const prisma = new PrismaClient()

const nodemailer = require("nodemailer");
require('dotenv').config();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch(req.method) {
        case 'POST':
            const data = req.body;

            const { email, password, firstName, lastName } = data;

            if (process.env.SIGNUPS_ENABLED === "false") {
                res
                    .status(405)
                    .json({ message: 'Not allowed - signups are currently disabled!'});
                return;
            }

            if (!email || !email.includes('@')) {
                res
                    .status(422)
                    .json({ message: 'Invalid data - email not valid'});
                    return;
            }

            if (!(await validatePassword(password))) {
                res
                    .status(422)
                    .json({ message: 'Invalid data - password consists of less than 8 characters'});
                return;
            }

            const lookupUser = await prisma.user.findFirst({
                where: {
                    email: email
                }
            });
            
            if (lookupUser) {
                res
                    .status(409)
                    .json({ message: 'Conflict - email already in use'});
                return;
            }

            const { hashedSaltedPassword, salt } = await hashAndSaltPassword(password);
            const user = await prisma.user.create({
                data: {
                    email: email,
                    password: hashedSaltedPassword,
                    salt: salt,
                    firstName: firstName,
                    lastName: lastName,
                    isVerified: false,
                }
            });

            const generatedToken = generateToken();

            var expiryDate = new Date();
            // set expiryDate one week from now
            expiryDate.setDate(expiryDate.getDate() + 7);

            const verificationToken = await prisma.verificationToken.create({
                data: {
                    userId: user.id,
                    token: generatedToken,
                    expiryDate: expiryDate,
                    isArchived: false,
                }
            });

            let transporter = nodemailer.createTransport({
                host: "sandbox.smtp.mailtrap.io",
                port: 2525,
                auth: {
                  user: `${process.env.MAILTRAP_USER}`,
                  pass: `${process.env.MAILTRAP_PASS}`,
                }
            });

            let info = await transporter.sendMail({
                from: '"Flo Ho" <flo@onlaunch.com>',
                to: `${user.email}`,
                subject: 'Verify your OnLaunch account',
                text: `Servas ${user.firstName}, please verify your OnLaunch account: <a href='localhost:3000/verify?token=${verificationToken.token}'>verify now</a>`,
                html: `Servas <b>${user.firstName}</b>,<br/><br/>please verify your OnLaunch account:<br/><br/>link: <a href='localhost:3000/verify?token=${verificationToken.token}'>verify now</a><br/>Your link expires in 7 days<br/><br/>Flo von OnLaunch`,
            });

            res.status(201).json(user);
            break

        default:
            res.status(405).end('method not allowed');
            break
    }
        
}
