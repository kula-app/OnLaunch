// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
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

    const email = session.user?.email as string;

    const user = await prisma.user.findFirst({
        where: {
            email: email
        }
    });

    if (!user || ( user && !user.id)) {
        res.status(400).json({ message: 'User not found!' });
        return;
    }
    
    const userInOrg = await prisma.usersInOrganisations.findFirst({
        where: {
            user: {
                id: user.id
            },
            org: {
                id: Number(req.query.orgId)
            },
        },
        select: {
            role: true
        }
    });

    if (userInOrg?.role !== "ADMIN" && userInOrg?.role !== "USER") {
        // if user has no business with this organisation, return a 404
        res.status(404).json({ message: 'no organisation found with id ' + req.query.orgId });
        return;
    }
    
    switch (req.method) {
        case 'GET':
            const allMessages = await prisma.message.findMany({
                include: {
                    actions: true
                },
                where: {
                    appId: Number(req.query.appId)
                }
            })

            res.status(200).json(allMessages);
            break;

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

            res.status(201).json(message);
            break;

        default:
            res.status(405).json({ message: 'method not allowed' });
            return;
    }
}
