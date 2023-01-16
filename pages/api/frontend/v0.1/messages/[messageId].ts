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
            const message = await prisma.message.findUnique({
                where: {
                    id: Number(req.query.messageId)
                }
            })

            res.status(200).json(message)
            break

        case 'DELETE':
            const deletedMessage = await prisma.message.delete({
                where: {
                    id: Number(req.query.messageId)
                }
            })

            res.status(200).json(deletedMessage)
            break

        case 'PUT':
            const updatedMessage = await prisma.message.update({
                where: {
                  id: Number(req.query.messageId)
                },
                data: {
                    blocking: req.body.blocking,
                    title: req.body.title,
                    body: req.body.body,
                    startDate: new Date(req.body.startDate),
                    endDate: new Date(req.body.endDate),
                    appId: req.body.appId
                }
            })
            res.status(201).json(updatedMessage)
            break

        default:
            res.status(405).end('method not allowed')
            break
    }
}
