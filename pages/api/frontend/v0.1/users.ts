import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashAndSaltPassword, validatePassword, generateToken, sendTokenPerMail } from '../../../../util/auth';
import { getSession } from 'next-auth/react';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // TODO: remove duplicate code, e.g. `const session = await getSession({ ... })`
    
    switch(req.method) {
        // TODO: instead of creating user via POST /users, it might be clearer for maintenance to use POST /auth/register
        case 'POST':
            const data = req.body;

            const { email, password, firstName, lastName } = data;

            // TODO: we should consider proxying all the environment flags with a configuration class
            if (process.env.SIGNUPS_ENABLED === "false") {
                res
                    .status(StatusCodes.METHOD_NOT_ALLOWED)
                    .json({ message: 'Not allowed - signups are currently disabled!'});
                return;
            }

            if (!email || !email.includes('@')) {
                res
                    .status(StatusCodes.UNPROCESSABLE_ENTITY)
                    .json({ message: 'Invalid data - email not valid'});
                    return;
            }

            if (!(await validatePassword(password))) {
                res
                    .status(StatusCodes.UNPROCESSABLE_ENTITY)
                    .json({ message: 'Invalid data - password consists of less than 8 characters'});
                return;
            }

            const lookupUser = await prisma.user.findFirst({
                where: {
                    email: email,
                    NOT: {
                        isDeleted: true,
                    }
                }
            });
            
            if (lookupUser) {
                res
                    .status(StatusCodes.CONFLICT)
                    .json({ message: 'Conflict - email already in use'});
                return;
            }

            const { hashedSaltedPassword, salt } = await hashAndSaltPassword(password);

            const createdUser = await prisma.user.create({
                data: {
                    email: email,
                    password: hashedSaltedPassword,
                    salt: salt,
                    firstName: firstName,
                    lastName: lastName,
                    isVerified: false,
                }
            });

            const generatedToken = generateToken();
        
            var expiryDate = new Date();
            // set expiryDate one week from now
            expiryDate.setDate(expiryDate.getDate() + 7);
    
            const verificationToken = await prisma.verificationToken.create({
                data: {
                    userId: createdUser.id,
                    token: generatedToken,
                    expiryDate: expiryDate,
                    isArchived: false,
                }
            });
    
            sendTokenPerMail(createdUser.email as string, createdUser.firstName as string, verificationToken.token, "VERIFY", "");
            
            res.status(StatusCodes.CREATED).json(email);
            break;

        case 'GET':
            const session = await getSession({ req: req });

            if (!session) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Not authorized!' });
                return;
            }

            const userFromDb = await prisma.user.findFirst({
                where: {
                    id: Number(session.user.id),
                    NOT: {
                        isDeleted: true,
                    }
                }
            });

            if (!userFromDb || ( userFromDb && !userFromDb.id)) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'User not found!' });
                return;
            }

            res.status(StatusCodes.CREATED).json({ email: userFromDb.email, firstName: userFromDb.firstName, lastName: userFromDb.lastName });
            break;
        
        case 'DELETE':
            const session2 = await getSession({ req: req });

            if (!session2) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Not authorized!' });
                return;
            }

            const userEmail2 = session2.user?.email as string;

            const userFromDb2 = await prisma.user.findFirst({
                where: {
                    email: userEmail2,
                    NOT: {
                        isDeleted: true,
                    }
                }
            });

            if (!userFromDb2 || ( userFromDb2 && !userFromDb2.id)) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'User not found!' });
                return;
            }

            // check if user is qualified to be deleted
            const userInOrgs = await prisma.usersInOrganisations.findMany({
                where: {
                    user: {
                        id: userFromDb2.id
                    },
                    role: "ADMIN"
                }
            });

            let orgsToDeleteFirst: Array<number> = [];
            
            await Promise.all(userInOrgs.map(async (userInOrg) => {
                const otherAdminsInOrg = await prisma.usersInOrganisations.findMany({
                    where: {
                        orgId: userInOrg.orgId,
                        role: "ADMIN",
                        NOT: {
                            userId: userInOrg.userId
                        }
                    }
                });
                
                if (Array.isArray(otherAdminsInOrg) && !otherAdminsInOrg.length) {
                    orgsToDeleteFirst.push(userInOrg.orgId);
                } 
            }));
            
            if (orgsToDeleteFirst.length) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'You have to delete these organisations first: ' + JSON.stringify(orgsToDeleteFirst) });
                return;
            }

            // if user qualifies to be deleted:
            const deletedUser = await prisma.user.update({
                where: {
                    id: userFromDb2.id
                },
                data: {
                    email: null,
                    firstName: null,
                    lastName: null,
                    password: null,
                    salt: null,
                    isDeleted: true,
                }
            });

            // delete user from organisations 
            await prisma.usersInOrganisations.deleteMany({
                where: {
                    userId: deletedUser.id
                }
            });

            res.status(StatusCodes.CREATED).json({ deletedUser });
            break;

        default:
            res.status(StatusCodes.METHOD_NOT_ALLOWED).end('method not allowed');
            break;
    }   
}
