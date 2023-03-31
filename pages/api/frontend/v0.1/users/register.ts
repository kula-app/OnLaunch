import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import type { NextApiRequest, NextApiResponse } from 'next';
import config from '../../../../../config/config';
import { MailType } from '../../../../../types/mailType';
import { generateToken, hashAndSaltPassword, sendTokenPerMail, validatePassword } from '../../../../../util/auth';

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch(req.method) {
        case 'POST':
            const data = req.body;

            const { email, password, firstName, lastName } = data;

            if (!config.signup.isEnabled) {
                res
                    .status(StatusCodes.METHOD_NOT_ALLOWED)
                    .json({ message: 'Not allowed - signups are currently disabled!'});
                return;
            }

            if (!email || !email.includes('@')) {
                res
                    .status(StatusCodes.UNPROCESSABLE_ENTITY)
                    .json({ message: 'Invalid data - email not valid'});
                    return;
            }

            if (!(await validatePassword(password))) {
                res
                    .status(StatusCodes.UNPROCESSABLE_ENTITY)
                    .json({ message: 'Invalid data - password consists of less than 8 characters'});
                return;
            }

            const lookupUser = await prisma.user.findFirst({
                where: {
                    email: email,
                    NOT: {
                        isDeleted: true,
                    }
                }
            });
            
            if (lookupUser) {
                res
                    .status(StatusCodes.CONFLICT)
                    .json({ message: 'Conflict - email already in use'});
                return;
            }

            const { hashedSaltedPassword, salt } = await hashAndSaltPassword(password);

            const createdUser = await prisma.user.create({
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
                    userId: createdUser.id,
                    token: generatedToken,
                    expiryDate: expiryDate,
                    isArchived: false,
                }
            });
    
            sendTokenPerMail(createdUser.email as string, createdUser.firstName as string, verificationToken.token, MailType.Verification);
            
            res.status(StatusCodes.CREATED).json(email);
            break;

        default:
            res.status(StatusCodes.METHOD_NOT_ALLOWED).end('method not allowed');
            break;
    }   
}
