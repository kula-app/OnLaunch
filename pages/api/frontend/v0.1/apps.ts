// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req: req });

    if (!session) {
        res.status(401).json({ message: 'Not authorized!' });
        return;
    }

    switch (req.method) {
        case 'GET':
            const allApps = await prisma.app.findMany({
                orderBy: {
                    id: 'asc'
                }
            })

            res.status(200).json(allApps)
            break

        case 'POST':
            const app = await prisma.app.create({
                data: {
                    name: req.body.name
                }
            })
            res.status(201).json(app)
            break

        default:
            res.status(405).end('method not allowed')
            break
    }
}
