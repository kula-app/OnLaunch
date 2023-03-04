// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashAndSaltPassword, validatePassword, verifyPassword } from '../../../../../util/auth';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    
    const data = req.body;

    const { password, passwordOld } = data;

    switch(req.method) {
        case 'PUT':
            const session = await getSession({ req: req });

            if (!session) {
                res.status(401).json({ message: 'Not authorized!' });
                return;
            }

            const userEmail = session.user?.email as string;

            if (!(await validatePassword(password))) {
                res
                    .status(422)
                    .json({ message: 'Invalid data - new password consists of less than 8 characters'});
                return;
            }
                
            const user = await prisma.user.findFirst({
                where: {
                    email: userEmail
                }
            });
                
            if (!user || ( user && !user.id)) {
                res.status(400).json({ message: 'User not found!' });
                return;
            }

            if (!(await verifyPassword(passwordOld.concat(user.salt), user.password))) {
                res.status(400).json({ message: 'Current password is wrong!' });
                return;
            }

            const { hashedSaltedPassword: newHashedSaltedPassword, salt: newSalt } = await hashAndSaltPassword(password);

            const createdUser = await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    password: newHashedSaltedPassword,
                    salt: newSalt,
                }
            });

            res.status(201).json(createdUser.email);
            break;

        default:
            res.status(405).end('method not allowed');
            break;
    }
        
}