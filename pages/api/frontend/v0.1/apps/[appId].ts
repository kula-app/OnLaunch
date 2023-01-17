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
            const app = await prisma.app.findUnique({
                include: {
                    messages: true
                },
                where: {
                    id: Number(req.query.appId)
                }
            })

            if (app == null) {
                res.status(404).end('no app found with id ' + req.query.appId)
            }

            res.status(200).json(app)
            break

        case 'DELETE':
            try {
                const deletedApp = await prisma.app.delete({
                    where: {
                        id: Number(req.query.appId)
                    }
                })

                res.status(200).json(deletedApp)
            } catch(e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    res.status(404).end('no app found with id ' + req.query.appId)
                }
            }
            break

        case 'PUT':
            try {
                const updatedApp = await prisma.app.update({
                    where: {
                        id: Number(req.query.appId)
                    },
                    data: {
                        name: req.body.name
                    }
                })

                res.status(201).json(updatedApp)
            } catch(e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    res.status(404).end('no app found with id ' + req.query.appId)
                }
            }
            break

        default:
            res.status(405).end('method not allowed')
            break
    }
}
