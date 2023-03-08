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

    const organisation = await prisma.organisation.findFirst({
        where: {
            invitationToken: token as string
        }
    });
    
    if (!organisation) {
        res.status(400).json({ message: `No organisation found with invite ${token}!` });
        return;
    }

    switch(req.method) {
        case 'GET':
            res.status(200).json({
                id: organisation.id,
                name: organisation.name,
                invitationToken: organisation.invitationToken,
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
            } catch (error) {
                res.status(400).json({ message: `User already in organisation!` });
                return;
            }

            res.status(200).json({ message: `User joined organisation!` });
            break;

        case 'PUT':
            const generatedToken = generateToken();

            await prisma.organisation.update({
                where: {
                    id: organisation.id,
                },
                data: {
                    invitationToken: generatedToken,
                }
            });

            res.status(200).json({ message: `Updated organisation!` });
            break;

        default:
            res.status(405).end('method not allowed');
            break;
    }
}