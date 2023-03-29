import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashAndSaltPassword, validatePassword, verifyPassword } from '../../../../../util/auth';
import { getSession } from 'next-auth/react';
import { StatusCodes } from 'http-status-codes';

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
                res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Not authorized!' });
                return;
            }

            const id = session.user?.id;

            if (!(await validatePassword(password))) {
                res
                    .status(StatusCodes.UNPROCESSABLE_ENTITY)
                    .json({ message: 'Invalid data - new password consists of less than 8 characters'});
                return;
            }
                
            const user = await prisma.user.findFirst({
                where: {
                    id: Number(id),
                    NOT: {
                        isDeleted: true,
                    }
                }
            });
                
            if (!user || ( user && !user.id)) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'User not found!' });
                return;
            }

            if (!(await verifyPassword(passwordOld, user.salt as string, user.password as string))) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'Current password is wrong!' });
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

            res.status(StatusCodes.CREATED).json(createdUser.email);
            break;

        default:
            res.status(StatusCodes.METHOD_NOT_ALLOWED).end('method not allowed');
            break;
    }
        
}