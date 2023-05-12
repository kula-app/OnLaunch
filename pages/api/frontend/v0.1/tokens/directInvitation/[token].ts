import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getUserFromRequest } from "../../../../../../util/auth";
import { Logger } from "../../../../../../util/logger";

const prisma: PrismaClient = new PrismaClient();

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
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: `No user invitation token found with ${token}` });
    return;
  }

  if (
    userInvitationToken.isArchived ||
    userInvitationToken.isObsolete ||
    userInvitationToken.expiryDate < new Date()
  ) {
    logger.error(`Provided user invitation token is obsolete`);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: `User invitation token is obsolete` });
    return;
  }

  logger.log(`Looking up organisation with id '${userInvitationToken.orgId}'`);
  const organisation = await prisma.organisation.findFirst({
    where: {
      id: userInvitationToken.orgId,
    },
  });

  if (!organisation) {
    logger.error(
      `No organisation found with id '${userInvitationToken.orgId}'`
    );
    res.status(StatusCodes.BAD_REQUEST).json({
      message: `No organisation found with id ${userInvitationToken.orgId}`,
    });
    return;
  }

  switch (req.method) {
    case "GET":
      res.status(StatusCodes.OK).json({
        id: organisation.id,
        name: organisation.name,
        invitationToken: userInvitationToken.token,
      });

      break;

    case "POST":
      try {
        logger.log(
          `Creating user with id '${user.id}' relation to organisation with id '${organisation.id}'`
        );
        await prisma.usersInOrganisations.create({
          data: {
            userId: user.id,
            orgId: organisation.id,
            role: "USER",
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
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: `User already in organisation` });
        return;
      }

      res.status(StatusCodes.OK).json({ message: `User joined organisation` });
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
