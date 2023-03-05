// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
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

    switch (req.method) {
        case 'GET':

            const orgsForUser = await prisma.usersInOrganisations.findMany({
                where: {
                    user: {
                        id: user.id
                    }
                },
                include: {
                    org: true
                }
            })

            res.status(200).json(
                orgsForUser.map((organisation): OrganisationDto => {
                  return {
                    id: organisation.orgId,
                    name: organisation.org.name,
                    role: organisation.role,
                  };
                })
              );
            break;

        case 'POST':
            const org = await prisma.usersInOrganisations.create({
                data: {
                    user: {
                        connect: {
                            id: user.id
                        }
                    },
                    role: 'ADMIN',
                    org: {
                        create: {
                            name: req.body.name
                        }
                    }
                }
            })
            res.status(201).json(org);
            break;

        default:
            res.status(405).json({ message: 'method not allowed' });
            return;
    }
}
