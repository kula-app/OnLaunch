import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest, generateToken } from "../../../../../util/auth";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../../../../util/logger";

const prisma: PrismaClient = new PrismaClient();

type OrganisationDto = {
  id: number;
  name: string;
  role: string;
  subName: string;
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
          org: {
            include: {
              subs: {
                where: {
                  isDeleted: false,
                },
              },
            },
          },
        },
      });

      res.status(StatusCodes.OK).json(
        orgsForUser.map((organisation): OrganisationDto => {
          return {
            id: organisation.orgId,
            name: organisation.org.name,
            role: organisation.role,
            subName:
              organisation.org.subs && organisation.org.subs.length > 0
                ? organisation.org.subs[0].subName
                : "free",
          };
        })
      );
      break;

    case "POST":
      const generatedToken = generateToken();

      logger.log(`Creating new organisation for user with id '${user.id}'`);
      const userInOrg = await prisma.usersInOrganisations.create({
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
      res.status(StatusCodes.CREATED).json(userInOrg);
      break;

    default:
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
      return;
  }
}
