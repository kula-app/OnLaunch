// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashAndSaltPassword, validatePassword, verifyPassword } from '../../../../util/auth';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    
    const data = req.body;

    const { email, password, passwordOld, firstName, lastName } = data;

    switch(req.method) {
        case 'POST':

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
            await prisma.user.create({
                data: {
                    email: email,
                    password: hashedSaltedPassword,
                    salt: salt,
                    firstName: firstName,
                    lastName: lastName,
                    isVerified: false,
                }
            });

            res.status(201).json(email);
            break;

        case 'GET':
            const session = await getSession({ req: req });

            if (!session) {
                res.status(401).json({ message: 'Not authorized!' });
                return;
            }

            const userEmail = session.user?.email as string;

            const userFromDb = await prisma.user.findFirst({
                where: {
                    email: userEmail
                }
            });

            if (!userFromDb || ( userFromDb && !userFromDb.id)) {
                res.status(400).json({ message: 'User not found!' });
                return;
            }
            
            res.status(201).json({ email: userEmail, firstName: userFromDb.firstName, lastName: userFromDb.lastName });
            break;

        default:
            res.status(405).end('method not allowed');
            break;
    }
        
}
