// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { generateToken, sendTokenPerMail } from '../../../../../util/auth';

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    
    const data = req.body;

    const { emailNew, token } = data;

    switch(req.method) {
        case 'POST':
            const session = await getSession({ req: req });

            if (!session) {
                res.status(401).json({ message: 'Not authorized!' });
                return;
            }

            if (!emailNew || !emailNew.includes('@')) {
                res
                    .status(422)
                    .json({ message: 'Invalid data - email not valid'});
                    return;
            }

            const userEmail = session.user?.email as string;

            const user = await prisma.user.findFirst({
                where: {
                    email: userEmail,
                    NOT: {
                        isDeleted: true,
                    }
                }
            });
                
            if (!user || ( user && !user.id)) {
                res.status(400).json({ message: 'User not found!' });
                return;
            }

            const userWithNewEmail = await prisma.user.findFirst({
                where: {
                    email: emailNew,
                    NOT: {
                        isDeleted: true,
                    }
                }
            });
                
            if (userWithNewEmail) {
                res.status(400).json({ message: 'Email address not available!' });
                return;
            }

            const generatedToken = generateToken();

            var expiryDate = new Date();
            // set expiryDate one hour from now
            expiryDate.setTime(expiryDate.getTime() + (60*60*1000));

            await prisma.emailChangeToken.updateMany({
                where: {
                    userId: user.id,
                    isObsolete: false,
                },
                data: {
                    isObsolete: true,
                }
            });

            const emailToken = await prisma.emailChangeToken.create({
                data: {
                    userId: user.id,
                    token: generatedToken,
                    expiryDate: expiryDate,
                    newEmail: emailNew,
                    currentEmail: userEmail,
                }
            });

            sendTokenPerMail(emailToken.newEmail as string, user.firstName as string, generatedToken, "CHANGE_EMAIL", "");

            res.status(201).json(user.email);
            break;
        
        case 'PUT':
            const lookupToken = await prisma.emailChangeToken.findFirst({
                where: {
                    token: token
                }
            });
                    
            if (!lookupToken) {
                res
                    .status(404)
                    .json({ message: 'EmailChange token not found!'});
                return;
            }
        
            if (lookupToken && (lookupToken.isArchived || lookupToken.isObsolete || lookupToken.expiryDate < new Date())) {
                res
                    .status(400)
                    .json({ message: 'Verification token is obsolete!'});
                return;
            }

            await prisma.user.update({
                where: {
                    id: lookupToken.userId,
                },
                data: {
                    email: lookupToken.newEmail,
                }
            });

            sendTokenPerMail(lookupToken.currentEmail as string, "OnLaunch user", "", "MAIL_CHANGED", "");

            await prisma.emailChangeToken.update({
                where: {
                    id: lookupToken.id,
                },
                data: {
                    isArchived: true,
                }
            });

            res.status(200).json(lookupToken.newEmail);
            break;

        default:
            res.status(405).end('method not allowed');
            break;
    }
        
}