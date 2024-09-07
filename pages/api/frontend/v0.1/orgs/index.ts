import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/services/db";
import { User } from "../../../../../models/user";
import { generateToken } from "../../../../../util/auth";
import { authenticatedHandler } from "../../../../../util/authenticatedHandler";
import { Logger } from "../../../../../util/logger";

type OrganisationDto = {
  id: number;
  name: string;
  role: string;
  subName: string;
};

const logger = new Logger(__filename);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return authenticatedHandler(
    req,
    res,
    { method: "basic" },
    async (req, res, user) => {
      switch (req.method) {
        case "GET":
          return getHandler(req, res, user);
        case "POST":
          return postHandler(req, res, user);
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
) {
  logger.log(
    `Looking up organisations that user with id '${user.id}' is part of`,
  );
  const orgsForUser = await prisma.usersInOrganisations.findMany({
    where: {
      user: {
        id: user.id,
        isDeleted: false,
      },
      org: {
        isDeleted: false,
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

  return res.status(StatusCodes.OK).json(
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
    }),
  );
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
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

  return res.status(StatusCodes.CREATED).json(userInOrg);
}
