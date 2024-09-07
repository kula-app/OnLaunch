import { User } from '@/models/user';
import prisma from '@/services/db';
import { generateToken } from '@/util/auth';
import { authenticatedHandler } from '@/util/authenticatedHandler';
import { Logger } from '@/util/logger';
import { StatusCodes } from 'http-status-codes';
import type { NextApiRequest, NextApiResponse } from 'next';

type AppDto = {
  id: number;
  name: string;
  role: string;
  activeMessages: number;
};

const logger = new Logger(__filename);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  return authenticatedHandler(
    req,
    res,
    { method: 'withRole' },
    async (req, res, user) => {
      switch (req.method) {
        case 'GET':
          return getHandler(req, res, user);

        case 'POST':
          return postHandler(req, res, user);

        default:
          return res
            .status(StatusCodes.METHOD_NOT_ALLOWED)
            .json({ message: 'Method not allowed' });
      }
    },
  );
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  const org = await prisma.organisation.findFirst({
    where: {
      id: Number(req.query.orgId),
      isDeleted: false,
    },
  });

  if (!org) {
    logger.error(
      `Organisation with id '${req.query.orgId}' has been deleted or not found`,
    );
    return res.status(StatusCodes.NOT_FOUND).json({
      message: `Organisation with id '${req.query.orgId}' not found`,
    });
  }

  logger.log(`Looking up apps with org id '${req.query.orgId}'`);
  const allApps = await prisma.app.findMany({
    where: {
      orgId: Number(req.query.orgId),
    },
    orderBy: {
      id: 'asc',
    },
    include: {
      messages: {
        where: {
          AND: [
            {
              startDate: {
                lte: new Date(),
              },
            },
            {
              endDate: {
                gte: new Date(),
              },
            },
          ],
        },
      },
    },
  });

  return res.status(StatusCodes.OK).json(
    allApps.map((app): AppDto => {
      return {
        id: app.id,
        name: app.name,
        role: user.role as string,
        activeMessages: app.messages.length,
      };
    }),
  );
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  const generatedToken = generateToken();

  logger.log(`Creating app '${req.body.name}' for org id '${req.query.orgId}'`);
  const app = await prisma.app.create({
    data: {
      name: req.body.name,
      orgId: req.body.orgId,
      publicKey: generatedToken,
    },
  });

  return res.status(StatusCodes.CREATED).json(app);
}
