import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { getUserFromRequest } from "../../../../../../util/auth";
import { Logger } from "../../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const data = req.query;

  const { token } = data;

  const user = await getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  logger.log("Looking up user invitation token");
  const userInvitationToken = await prisma.userInvitationToken.findFirst({
    where: {
      token: token as string,
    },
  });

  if (!userInvitationToken) {
    logger.error(`Provided user invitation token not found`);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: `No user invitation token found with ${token}` });
  }

  if (
    userInvitationToken.isArchived ||
    userInvitationToken.isObsolete ||
    userInvitationToken.expiryDate < new Date()
  ) {
    logger.error(`Provided user invitation token is obsolete`);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: `User invitation token is obsolete` });
  }

  logger.log(`Looking up organisation with id '${userInvitationToken.orgId}'`);
  const organisation = await prisma.organisation.findFirst({
    where: {
      id: userInvitationToken.orgId,
      isDeleted: false,
    },
  });

  if (!organisation) {
    logger.error(
      `No organisation found with id '${userInvitationToken.orgId}'`
    );
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: `No organisation found with id ${userInvitationToken.orgId}`,
    });
  }

  switch (req.method) {
    case "GET":
      return res.status(StatusCodes.OK).json({
        id: organisation.id,
        name: organisation.name,
        invitationToken: userInvitationToken.token,
      });

    case "POST":
      try {
        logger.log(
          `Creating user with id '${user.id}' relation to organisation with id '${organisation.id}'`
        );
        await prisma.usersInOrganisations.create({
          data: {
            userId: user.id,
            orgId: organisation.id,
            role: userInvitationToken.role,
          },
        });

        logger.log(`Updating user invitation token as obsolete`);
        await prisma.userInvitationToken.update({
          where: {
            token: userInvitationToken.token,
          },
          data: {
            isArchived: true,
          },
        });
      } catch (error) {
        logger.error("User already in organisation");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: `User already in organisation` });
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: `User joined organisation` });

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
