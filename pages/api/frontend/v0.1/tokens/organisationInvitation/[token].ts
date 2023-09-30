import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { generateToken, getUserFromRequest } from "../../../../../../util/auth";
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

  logger.log("Looking up organisation invitation token");
  const organisation = await prisma.organisation.findFirst({
    where: {
      invitationToken: token as string,
      isDeleted: false,
    },
  });

  if (!organisation) {
    logger.error(`Provided organisation invite token not found`);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: `No organisation found with invite ${token}!` });
    return;
  }

  switch (req.method) {
    case "GET":
      res.status(StatusCodes.OK).json({
        id: organisation.id,
        name: organisation.name,
        invitationToken: organisation.invitationToken,
      });

      break;

    case "POST":
      try {
        logger.log(
          `Creating user with id '${user.id}' relation to organisation with id '${organisation.id}' (via org token)`
        );
        await prisma.usersInOrganisations.create({
          data: {
            userId: user.id,
            orgId: organisation.id,
            role: "USER",
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

    case "PUT":
      const generatedToken = generateToken();

      logger.log(
        `Updating new generated invite token for organisation with id '${organisation.id}'`
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

      res.status(StatusCodes.OK).json({ message: `Updated organisation` });
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
