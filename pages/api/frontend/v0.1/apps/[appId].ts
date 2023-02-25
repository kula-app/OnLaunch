// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma } from '@prisma/client'
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
            const app = await prisma.app.findUnique({
                include: {
                    messages: {
                        include: {
                            actions: true
                        },
                        orderBy: [
                            {
                                startDate: 'asc'
                            }, 
                            {
                                endDate: 'asc'
                            }
                        ]
                    }
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
