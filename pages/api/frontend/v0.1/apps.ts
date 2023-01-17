// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            const allApps = await prisma.app.findMany()

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
