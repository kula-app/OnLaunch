// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import {PrismaClient, Prisma} from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            const message = await prisma.message.findUnique({
                include: {
                    actions: true
                },
                where: {
                    id: Number(req.query.messageId)
                }
            })

            if (message == null) {
                res.status(404).end('no message found with id ' + req.query.messageId)
            }

            res.status(200).json(message)
            break

        case 'DELETE':
            try {
                const deletedMessage = await prisma.message.delete({
                    where: {
                        id: Number(req.query.messageId)
                    }
                })

                res.status(200).json(deletedMessage)
            } catch(e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    res.status(404).end('no message found with id ' + req.query.messageId)
                }
            }
            break

        case 'PUT':
            try {
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
            } catch(e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    res.status(404).end('no message found with id ' + req.query.messageId)
                }
            }
            break

        default:
            res.status(405).end('method not allowed')
            break
    }
}
