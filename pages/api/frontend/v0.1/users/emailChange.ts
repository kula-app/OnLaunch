import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { generateToken, sendTokenPerMail } from '../../../../../util/auth';
import { StatusCodes } from 'http-status-codes';
import { MailType } from '../../../../../types/mailType';

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
                res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Not authorized!' });
                return;
            }

            if (!emailNew || !emailNew.includes('@')) {
                res
                    .status(StatusCodes.UNPROCESSABLE_ENTITY)
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
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'User not found!' });
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
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email address not available!' });
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

            sendTokenPerMail(emailToken.newEmail as string, user.firstName as string, generatedToken, MailType.ChangeEmail);

            res.status(StatusCodes.CREATED).json(user.email);
            break;
        
        case 'PUT':
            const lookupToken = await prisma.emailChangeToken.findFirst({
                where: {
                    token: token
                }
            });
                    
            if (!lookupToken) {
                res
                    .status(StatusCodes.NOT_FOUND)
                    .json({ message: 'EmailChange token not found!'});
                return;
            }
        
            if (lookupToken && (lookupToken.isArchived || lookupToken.isObsolete || lookupToken.expiryDate < new Date())) {
                res
                    .status(StatusCodes.BAD_REQUEST)
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

            sendTokenPerMail(lookupToken.currentEmail as string, "OnLaunch user", "", MailType.EmailChanged);

            await prisma.emailChangeToken.update({
                where: {
                    id: lookupToken.id,
                },
                data: {
                    isArchived: true,
                }
            });

            res.status(StatusCodes.OK).json(lookupToken.newEmail);
            break;

        default:
            res.status(StatusCodes.METHOD_NOT_ALLOWED).end('method not allowed');
            break;
    }
        
}