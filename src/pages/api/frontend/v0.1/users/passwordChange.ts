import { User } from '@/models/user';
import prisma from '@/services/db';
import {
  hashAndSaltPassword,
  validatePassword,
  verifyPassword,
} from '@/util/auth';
import { authenticatedHandler } from '@/util/authenticatedHandler';
import { Logger } from '@/util/logger';
import { StatusCodes } from 'http-status-codes';
import type { NextApiRequest, NextApiResponse } from 'next';

const logger = new Logger(__filename);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return authenticatedHandler(
    req,
    res,
    { method: 'basic' },
    async (req, res, user) => {
      switch (req.method) {
        case 'PUT':
          return putHandler(req, res, user);
        default:
          return res
            .status(StatusCodes.METHOD_NOT_ALLOWED)
            .json({ message: 'Method not allowed' });
      }
    },
  );
}

async function putHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  const { password, passwordOld } = req.body;

  const id = user.id;

  if (!(await validatePassword(password))) {
    logger.error('New password is too short');
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      message: 'Invalid data - new password consists of less than 8 characters',
    });
  }

  logger.log(`Looking up user with id '${id}'`);
  const userById = await prisma.user.findFirst({
    where: {
      id: Number(id),
      NOT: {
        isDeleted: true,
      },
    },
  });

  if (!userById || (userById && !userById.id)) {
    logger.error(`No user found with id '${id}'`);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'User not found!' });
  }

  if (
    !(await verifyPassword(
      passwordOld,
      userById.salt as string,
      userById.password as string,
    ))
  ) {
    logger.error('Current password is wrong');
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Current password is wrong' });
  }

  const { hashedSaltedPassword: newHashedSaltedPassword, salt: newSalt } =
    await hashAndSaltPassword(password);

  logger.log(`Updating password of user with id '${id}'`);
  const updatedUser = await prisma.user.update({
    where: {
      id: userById.id,
    },
    data: {
      password: newHashedSaltedPassword,
      salt: newSalt,
    },
  });

  return res.status(StatusCodes.CREATED).json(updatedUser.email);
}
