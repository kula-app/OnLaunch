// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient()

type AppDto = {
    id: number;
    name: string;
    role: string;
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
            email: email,
            NOT: {
                isDeleted: true,
            }
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
        // if user has no business here, return a 404
        res.status(404).json({ message: 'no organisation found with id ' + req.query.orgId });
        return;
    }

    switch (req.method) {
        case 'GET':
            const allApps = await prisma.app.findMany({
                where: {
                    orgId: Number(req.query.orgId),
                },
                orderBy: {
                    id: 'asc'
                }
            })

            res.status(200).json(
                allApps.map((app): AppDto => {
                  return {
                    id: app.id,
                    name: app.name,
                    role: userInOrg?.role,
                  };
                })
              );
            break;

        case 'POST':
            const app = await prisma.app.create({
                data: {
                    name: req.body.name,
                    orgId: req.body.orgId,
                }
            })
            res.status(201).json(app);
            break;

        default:
            res.status(405).json({ message: 'method not allowed' });
            return;
    }
}
