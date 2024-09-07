import { Organisation } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { User } from "../../../../../../models/user";
import { generateToken } from "../../../../../../util/auth";
import { authenticatedHandler } from "../../../../../../util/authenticatedHandler";
import { Logger } from "../../../../../../util/logger";

const logger = new Logger(__filename);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return authenticatedHandler(
    req,
    res,
    { method: "basic" },
    async (req, res, user) => {
      const data = req.query;

      const { token } = data;

      logger.log("Looking up organisation invitation token");
      const organisation = await prisma.organisation.findFirst({
        where: {
          invitationToken: token as string,
          isDeleted: false,
        },
      });

      if (!organisation) {
        logger.error(`Provided organisation invite token not found`);
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: `No organisation found with invite ${token}!` });
      }

      switch (req.method) {
        case "GET":
          return getHandler(req, res, user, organisation);
        case "POST":
          return postHandler(req, res, user, organisation);
        case "PUT":
          return putHandler(req, res, user, organisation);
        default:
          return res
            .status(StatusCodes.METHOD_NOT_ALLOWED)
            .json({ message: "Method not allowed" });
      }
    },
  );
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
  organisation: Organisation,
) {
  return res.status(StatusCodes.OK).json({
    id: organisation.id,
    name: organisation.name,
    invitationToken: organisation.invitationToken,
  });
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
  organisation: Organisation,
) {
  try {
    logger.log(
      `Creating user with id '${user.id}' relation to organisation with id '${organisation.id}' (via org token)`,
    );
    await prisma.usersInOrganisations.create({
      data: {
        userId: user.id!,
        orgId: organisation.id,
        role: "USER",
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
}

async function putHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
  organisation: Organisation,
) {
  const generatedToken = generateToken();

  logger.log(
    `Updating new generated invite token for organisation with id '${organisation.id}'`,
  );
  await prisma.organisation.update({
    where: {
      id: organisation.id,
      isDeleted: false,
    },
    data: {
      invitationToken: generatedToken,
    },
  });

  return res.status(StatusCodes.OK).json({ message: `Updated organisation` });
}
