// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            // TODO: how is this validating the token? 
            const resetToken = await prisma.passwordResetToken.findFirst({
                where: {
                    token: req.query.token as string
                }
            });

            if (resetToken == null) {
                res.status(404).json({ message: 'no token found that looks like this: ' + req.query.token });
                return;
            }

            if (resetToken && (resetToken.isArchived || resetToken.isObsolete || resetToken.expiryDate < new Date())) {
                res.status(404).json({ message: 'no token found that looks like this: ' + req.query.token });
                return;
            }

            res.status(200).json(resetToken);
            break;

        default:
            res.status(405).json({ message: 'method not allowed' });
            return;
    }
}
