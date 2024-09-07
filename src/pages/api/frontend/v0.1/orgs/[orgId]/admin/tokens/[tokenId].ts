import { OrgAdminTokenDto } from '@/models/dtos/response/orgAdminTokenDto';
import { User } from '@/models/user';
import prisma from '@/services/db';
import { encodeOrgToken } from '@/util/adminApi/tokenEncoding';
import { authenticatedHandler } from '@/util/authenticatedHandler';
import { Logger } from '@/util/logger';
import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import type { NextApiRequest, NextApiResponse } from 'next';

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
      if (user.role !== 'ADMIN') {
        logger.error('User has no admin rights');
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: 'You are not an admin' });
      }

      switch (req.method) {
        case 'DELETE':
          return deleteHandler(req, res, user);

        default:
          return res
            .status(StatusCodes.METHOD_NOT_ALLOWED)
            .json({ message: 'Method not allowed' });
      }
    },
  );
}

async function deleteHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  const orgId = Number(req.query.orgId);
  const tokenId = Number(req.query.tokenId);

  try {
    logger.log(`Deleting organisation admin token for org id '${orgId}'`);
    const orgAdminToken = await prisma.organisationAdminToken.update({
      where: {
        id: tokenId,
        orgId: orgId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });

    const dto: OrgAdminTokenDto = {
      id: orgAdminToken.id,
      createdAt: orgAdminToken.createdAt,
      updatedAt: orgAdminToken.updatedAt,
      token: encodeOrgToken(orgAdminToken.token),
      label: orgAdminToken.label,
      role: orgAdminToken.role,
    };

    return res.status(StatusCodes.OK).json(dto);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`No org admin token found with id '${tokenId}'`);
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `No org admin token found with id '${tokenId}'` });
    }

    logger.error(`Internal server error occurred: ${e}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'An internal server error occurred - please try again later!',
    });
  }
}
