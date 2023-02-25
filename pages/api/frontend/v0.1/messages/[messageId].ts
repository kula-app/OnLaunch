// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma } from '@prisma/client'
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient()

enum ActionType {
    Button = "BUTTON",
    DismissButton = "DISMISS_BUTTON",
}

type Action = {
    id: number;
    actionType: ActionType;
    title: string;
    messageId: number;
};

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
                const deletedActions = await prisma.action.deleteMany({
                    where: {
                        messageId: Number(req.query.messageId)
                    }
                })

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

                const deletedActions = await prisma.action.deleteMany({
                    where: {
                        messageId: Number(req.query.messageId)
                    }
                })

                if (req.body.actions.length > 0) {
                    const actions: Action[] = req.body.actions;
                    actions.forEach(action => {
                        action.messageId = Number(req.query.messageId);
                    })
                    const savedActions = await prisma.action.createMany({
                        data: req.body.actions
                    });
                }

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
