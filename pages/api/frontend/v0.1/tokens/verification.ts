// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { generateToken, sendTokenPerMail } from '../../../../../util/auth';

const nodemailer = require("nodemailer");
require('dotenv').config();

const prisma = new PrismaClient()


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const data = req.body;

    const { token, email } = data;

    switch(req.method) {
        case 'POST':
            var id = -1;
            if (token) {
                const verificationToken = await prisma.verificationToken.findFirst({
                    where: {
                        token: token
                    }
                });

                id = Number(verificationToken?.userId);
            } else if (email) {
                var userByEmail = await prisma.user.findFirst({
                    where: {
                        email: email
                    }
                });
                console.log("email: " + email);
                id = Number(userByEmail?.id);
            } else {
                res
                    .status(400)
                    .json({ message: 'No token or email provided!'});
                return;
            }
            console.log("id= " + id)
            const unverifiedUser = await prisma.user.findUnique({
                where: {
                    id: id
                }
            });

            if (unverifiedUser?.isVerified) {
                res
                    .status(400)
                    .json({ message: 'User already verified!'});
                return;
            }

            const generatedToken = generateToken();
            
            var expiryDate = new Date();
            // set expiryDate one week from now
            expiryDate.setDate(expiryDate.getDate() + 7);

            await prisma.verificationToken.updateMany({
                where: {
                    userId: id,
                    isObsolete: false,
                },
                data: {
                    isObsolete: true,
                }
            });

            const verificationToken = await prisma.verificationToken.create({
                data: {
                    userId: id,
                    token: generatedToken,
                    expiryDate: expiryDate,
                    isArchived: false,
                }
            });

            sendTokenPerMail(
                unverifiedUser?.email as string, 
                unverifiedUser?.firstName as string, 
                verificationToken.token, "VERIFY", "");
            
            res.status(200).json({ message: "Link was successfully resend!" });
            break;
            
        case 'PUT':
            if (!token) {
                res
                    .status(400)
                    .json({ message: 'No token provided!'});
                return;
            }

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
        
            if (lookupToken && lookupToken.isObsolete) {
                res
                    .status(400)
                    .json({ message: 'Verification token is obsolete!'});
                return;
            }
        
            const user = await prisma.user.findUnique({
                where: {
                    id: lookupToken.userId
                }
            });

            if (user?.isVerified) {
                res
                    .status(400)
                    .json({ message: 'User already verified!'});
                return;
            }
        
            // if token expired and user not verified, create new token and send it to user
            if (lookupToken && lookupToken.expiryDate < new Date()) {
                res
                    .status(400)
                    .json({ message: 'Verification token expired!'});
                return;
            }

            await prisma.user.update({
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

            res.status(200).json(user?.email);
            break;

        default:
            res.status(405).end('method not allowed');
            break;
    }
        
}
