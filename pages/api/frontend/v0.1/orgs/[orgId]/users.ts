// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma } from '@prisma/client'
import { getSession } from 'next-auth/react';
import { generateToken, sendTokenPerMail } from '../../../../../../util/auth';

const prisma = new PrismaClient()

interface UserDto {
    id: number;
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
                },
                orderBy: {
                    createdAt: 'asc'
                }
            })

            if (usersInOrg == null) {
                res.status(404).json({ message: 'no users found in organisation with id ' + req.query.orgId });
                return;
            }

            res.status(200).json(
                usersInOrg.map((userInOrg): UserDto => {
                  return {
                    id: userInOrg.userId,
                    firstName: userInOrg.user.firstName as string,
                    lastName: userInOrg.user.lastName as string,
                    email: userInOrg.user.email as string,
                    role: userInOrg.role,
                  };
                })
              );
            break;

            case 'PUT':
                try {
                    if (userInOrg?.role === "USER") {
                        res.status(403).json({ message: 'you are not allowed to update user with id ' + req.query.userId + ' from organisation with id ' + req.query.orgId });
                        return;
                    }

                    if (userInOrg.userId === req.body.userId) {
                        res.status(400).json({ message: 'you cannot change your own role!' });
                        return;
                    }

                    const updatedApp = await prisma.usersInOrganisations.update({
                        where: {
                            orgId_userId: {
                                userId: Number(req.body.userId),
                                orgId: Number(req.body.orgId),
                            }
                        },
                        data: {
                            role: req.body.role
                        }
                    });
    
                    res.status(201).json(updatedApp);
                    return; 
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
                            email: req.body.email,
                            NOT: {
                                isDeleted: true,
                            }
                        }
                    });

                    if (user && user.id) {
                        await prisma.userInvitationToken.updateMany({
                            where: {
                                userId: userInOrg?.userId,
                                isObsolete: false,
                            },
                            data: {
                                isObsolete: true,
                            }
                        });

                        const generatedToken = generateToken();

                        var expiryDate = new Date();
                        // set expiryDate one hour from now
                        expiryDate.setTime(expiryDate.getTime() + (60*60*1000));

                        const uit = await prisma.userInvitationToken.create({
                            data: {
                                token: generatedToken,
                                orgId: userInOrg?.orgId,
                                userId: userInOrg?.userId,
                                expiryDate: expiryDate, 
                            }
                        });

                        sendTokenPerMail(user.email as string, user.firstName as string, generatedToken, "DIRECT_INVITE", "");

                        res.status(201).json(uit);
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
