import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import { generateToken } from "../../../../../util/auth";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

type OrganisationDto = {
  id: number;
  name: string;
  role: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req: req });

  if (!session) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authorized!" });
    return;
  }

  const id = session.user?.id;

  switch (req.method) {
    case "GET":
      const orgsForUser = await prisma.usersInOrganisations.findMany({
        where: {
          user: {
            id: Number(id),
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

      const org = await prisma.usersInOrganisations.create({
        data: {
          user: {
            connect: {
              id: Number(id),
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
