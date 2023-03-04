// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma } from '@prisma/client'
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient()

interface UserDto {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }

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
            const usersInOrg = await prisma.usersInOrganisations.findMany({
                include: {
                    user: true
                },
                where: {
                    orgId: Number(req.query.orgId),
                }
            })

            if (usersInOrg == null) {
                res.status(404).json({ message: 'no users found in organisation with id ' + req.query.orgId });
                return;
            }

            res.status(200).json(
                usersInOrg.map((userInOrg): UserDto => {
                  return {
                    firstName: userInOrg.user.firstName,
                    lastName: userInOrg.user.lastName,
                    email: userInOrg.user.email,
                    role: userInOrg.role,
                  };
                })
              );
            break;

        case 'DELETE':
            try {
                if (userInOrg?.role === "USER") {
                    res.status(403).json({ message: 'you are not allowed to delete user with id ' + req.query.userId + ' from organisation with id ' + req.query.orgId });
                    return;
                }
                const deletedUserInOrg = await prisma.usersInOrganisations.delete({
                    where: {
                        orgId_userId: {
                            userId: Number(req.query.userId),
                            orgId: Number(req.query.orgId),
                        }
                    }
                })

                res.status(200).json(deletedUserInOrg)
            } catch(e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    res.status(404).json({ message: 'no user with id ' + req.query.userId + ' found in organisation with id ' + req.query.appId });
                }
            }
            break;

            case 'PUT':
                try {
                    if (userInOrg?.role === "USER") {
                        res.status(403).json({ message: 'you are not allowed to update user with id ' + req.query.userId + ' from organisation with id ' + req.query.orgId });
                        return;
                    }
                    const updatedApp = await prisma.usersInOrganisations.update({
                        where: {
                            orgId_userId: {
                                userId: Number(req.query.userId),
                                orgId: Number(req.query.orgId),
                            }
                        },
                        data: {
                            role: req.body.role
                        }
                    });
    
                    res.status(201).json(updatedApp)
                } catch(e) {
                    if (e instanceof Prisma.PrismaClientKnownRequestError) {
                        res.status(404).json({ message: 'no user with id ' + req.query.userId + ' found in organisation with id ' + req.query.appId });
                    }
                }
                break;

            case 'POST':
                try {
                    if (userInOrg?.role === "USER") {
                        res.status(403).json({ message: 'you are not allowed to add user with email ' + req.body.email + ' to organisation with id ' + req.query.orgId });
                        return;
                    }

                    const user = await prisma.user.findFirst({
                        where: {
                            email: req.body.email
                        }
                    });

                    if (user && user.id) {
                        const org = await prisma.usersInOrganisations.create({
                            data: {
                                user: {
                                    connect: {
                                        id: user.id
                                    }
                                },
                                role: 'USER',
                                org: {
                                    create: {
                                        name: req.body.name
                                    }
                                }
                            }
                        })
                        res.status(201).json(org);
                        return;
                    }
                    res.status(400).json({ message: 'no user found for email' });
                    return;
                    
                } catch(e) {
                    if (e instanceof Prisma.PrismaClientKnownRequestError) {
                        res.status(404).json({ message: 'no user with id ' + req.query.userId + ' found in organisation with id ' + req.query.appId });
                    }
                }
                break;

        default:
            res.status(405).json({ message: 'method not allowed' });
            return;
    }
}
