// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch(req.method) {
        case 'PUT':
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
                    .json({ message: 'Token not found!'});
                return;
            }
            
            if (lookupToken && lookupToken.expiryDate < new Date()) {
                res
                    .status(400)
                    .json({ message: 'Token expired!'});
                return;
            }

            if (lookupToken && lookupToken.isArchived) {
                res
                    .status(400)
                    .json({ message: 'User already verified!'});
                return;
            }

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

            res.status(201).json(user);
            break

        default:
            res.status(405).end('method not allowed');
            break
    }
        
}
