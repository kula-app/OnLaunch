import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/services/db";
import { generateToken, getUserFromRequest } from "../../../../../util/auth";
import { Logger } from "../../../../../util/logger";

type OrganisationDto = {
  id: number;
  name: string;
  role: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const user = await getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  switch (req.method) {
    case "GET":
      logger.log(
        `Looking up organisations that user with id '${user.id}' is part of`
      );
      const orgsForUser = await prisma.usersInOrganisations.findMany({
        where: {
          user: {
            id: user.id,
          },
        },
        include: {
          org: true,
        },
      });

      res.status(StatusCodes.OK).json(
        orgsForUser.map((organisation): OrganisationDto => {
          return {
            id: organisation.orgId,
            name: organisation.org.name,
            role: organisation.role,
          };
        })
      );
      break;

    case "POST":
      const generatedToken = generateToken();

      logger.log(`Creating new organisation for user with id '${user.id}'`);
      const org = await prisma.usersInOrganisations.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          role: "ADMIN",
          org: {
            create: {
              name: req.body.name,
              invitationToken: generatedToken,
            },
          },
        },
      });
      res.status(StatusCodes.CREATED).json(org);
      break;

    default:
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
      return;
  }
}
