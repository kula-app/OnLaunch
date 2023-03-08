// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { generateToken } from '../../../../../../util/auth';

const prisma = new PrismaClient()


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const data = req.query;

    const { token } = data;

    const session = await getSession({ req: req });

    if (!session) {
        res.status(401).json({ message: 'Not authorized!' });
        return;
    }
    
    const id = session.user?.id;

    const userInvitationToken = await prisma.userInvitationToken.findFirst({
        where: {
            token: token as string
        }
    });
    
    if (!userInvitationToken) {
        res.status(400).json({ message: `No user invitation token found with ${token}!` });
        return;
    }

    if (userInvitationToken.isArchived || userInvitationToken.isObsolete || userInvitationToken.expiryDate < new Date()) {
        res.status(400).json({ message: `User invitation token is obsolete!` });
        return;
    }

    const organisation = await prisma.organisation.findFirst({
        where: {
            id: userInvitationToken.orgId
        }
    });

    if (!organisation) {
        res.status(400).json({ message: `No organisation found with id ${userInvitationToken.orgId}!` });
        return;
    }

    switch(req.method) {
        case 'GET':
            res.status(200).json({
                id: organisation.id,
                name: organisation.name,
                invitationToken: userInvitationToken.token,
            });

            break;

        case 'POST':
            try {
                await prisma.usersInOrganisations.create({
                    data: {
                        userId: id,
                        orgId: organisation.id,
                        role: "USER",
                    }
                });

                await prisma.userInvitationToken.update({
                    where: {
                        token: userInvitationToken.token
                    }, 
                    data: {
                        isArchived: true
                    }
                });
            } catch (error) {
                res.status(400).json({ message: `User already in organisation!` });
                return;
            }

            res.status(200).json({ message: `User joined organisation!` });
            break;

        default:
            res.status(405).end('method not allowed');
            break;
    }
}