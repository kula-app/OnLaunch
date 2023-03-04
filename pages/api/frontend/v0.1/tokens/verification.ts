// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../../../../../util/auth';

const nodemailer = require("nodemailer");
require('dotenv').config();

const prisma = new PrismaClient()


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    
    const data = req.body;

    const { token } = data;

    const lookupToken = await prisma.verificationToken.findFirst({
        where: {
            token: token
        }
    });
            
    if (!lookupToken) {
        res
            .status(404)
            .json({ message: 'Verification token not found!'});
        return;
    }

    if (lookupToken && lookupToken.isArchived) {
        res
            .status(400)
            .json({ message: 'User already verified!'});
        return;
    }

    // if token expired and user not verified, create new token and send it to user
    if (lookupToken && lookupToken.expiryDate < new Date()) {
        const generatedToken = generateToken();

        var expiryDate = new Date();
        // set expiryDate one week from now
        expiryDate.setDate(expiryDate.getDate() + 7);

        await prisma.verificationToken.updateMany({
            where: {
                userId: lookupToken.userId,
            },
            data: {
                isObsolete: true,
            }
        });

        const verificationToken = await prisma.verificationToken.create({
            data: {
                userId: lookupToken.userId,
                token: generatedToken,
                expiryDate: expiryDate,
                isArchived: false,
            }
        });

        const user = await prisma.user.findUnique({
            where: {
                id: lookupToken.userId
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
            to: `${user?.email}`,
            subject: 'Verify your OnLaunch account',
            text: `Servas ${user?.firstName}, please verify your OnLaunch account: <a href='localhost:3000/verify?token=${verificationToken.token}'>verify now</a>`,
            html: `Servas <b>${user?.firstName}</b>,<br/><br/>please verify your OnLaunch account:<br/><br/>link: <a href='localhost:3000/verify?token=${verificationToken.token}'>verify now</a><br/>Your link expires in 7 days<br/><br/>Flo von OnLaunch`,
        });
        res
            .status(400)
            .json({ message: 'Verification token expired!'});
        return;
    }
    
    switch(req.method) {
        case 'PUT':
            const user = await prisma.user.update({
                where: {
                    id: lookupToken.userId,
                },
                data: {
                    isVerified: true,
                }
            });

            await prisma.verificationToken.update({
                where: {
                    id: lookupToken.id,
                },
                data: {
                    isArchived: true,
                }
            });

            res.status(200).json(user);
            break;

        default:
            res.status(405).end('method not allowed');
            break;
    }
        
}
