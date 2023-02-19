// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashAndSaltPassword, validatePassword } from '../../../../util/auth';

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch(req.method) {
        case 'POST':
            const data = req.body;

            const { email, password } = data;

            if (!email || !email.includes('@')) {
                res
                    .status(422)
                    .json({ message: 'Invalid data - email not valid'});
                    return;
            }

            if (!(await validatePassword(password))) {
                res
                    .status(422)
                    .json({ message: 'Invalid data - password not valid'});
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
                }
            });

            res.status(201).json(user);
            break

        default:
            res.status(405).end('method not allowed');
            break
    }
        
}
