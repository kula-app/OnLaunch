// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma } from '@prisma/client'
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient()

type OrganisationDto = {
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
        // if user has no business here, return a 404
        res.status(404).json({ message: 'no organisation found with id ' + req.query.orgId });
        return;
    }

    switch (req.method) {
        case 'GET':
            const org = await prisma.organisation.findUnique({
                where: {
                    id: Number(req.query.orgId)
                },
                include: {
                    apps: true
                }
            })

            if (org == null) {
                res.status(404).json({ message: 'no organisation found with id ' + req.query.orgId });
                return;
            }

            res.status(200).json(org);
            break;

        case 'DELETE':
            try {
                if (userInOrg?.role === "USER") {
                    res.status(403).json({ message: 'you are not allowed to delete organisation with id ' + req.query.orgId });
                    return;
                }
                const deletedUsersInOrgs = await prisma.usersInOrganisations.deleteMany({
                    where: {
                        orgId: Number(req.query.orgId)
                    }
                });
                const deletedOrg = await prisma.organisation.delete({
                    where: {
                        id: Number(req.query.orgId)
                    }
                });

                res.status(200).json(deletedOrg)
            } catch(e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    res.status(404).json({ message: 'no org found with id ' + req.query.orgId })
                    return;
                }
            }
            break;

        case 'PUT':
            try {
                if (userInOrg?.role === "USER") {
                    res.status(403).json({ message: 'you are not allowed to update organisation with id ' + req.query.orgId });
                }
                const updatedOrg = await prisma.organisation.update({
                    where: {
                        id: Number(req.query.orgId)
                    },
                    data: {
                        name: req.body.name
                    }
                });

                res.status(201).json(updatedOrg)
            } catch(e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    res.status(404).json({ message: 'no org found with id ' + req.query.orgId });
                }
            }
            break;

        default:
            res.status(405).json({ message: 'method not allowed' });
            return;
    }
}

