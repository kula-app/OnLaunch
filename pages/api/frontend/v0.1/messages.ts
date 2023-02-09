// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import {PrismaClient} from '@prisma/client'

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
    switch (req.method) {
        case 'GET':
            const allMessages = await prisma.message.findMany({
                include: {
                    actions: true
                }
            })

            res.status(200).json(allMessages)
            break

        case 'POST':
            const message = await prisma.message.create({
                data: {
                    blocking: req.body.blocking,
                    title: req.body.title,
                    body: req.body.body,
                    startDate: new Date(req.body.startDate),
                    endDate: new Date(req.body.endDate),
                    appId: req.body.appId,
                }
            });

            if (req.body.actions.length > 0) {
                const actions: Action[] = req.body.actions;
                actions.forEach(action => {
                    action.messageId = message.id
                })
                const savedActions = await prisma.action.createMany({
                    data: req.body.actions
                });
            }

            res.status(201).json(message)
            break

        default:
            res.status(405).end('method not allowed')
            break
    }
}
