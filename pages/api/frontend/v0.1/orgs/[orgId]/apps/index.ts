import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import { generateToken } from "../../../../../../../util/auth";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

type AppDto = {
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

  const userInOrg = await prisma.usersInOrganisations.findFirst({
    where: {
      user: {
        id: Number(id),
      },
      org: {
        id: Number(req.query.orgId),
      },
    },
    select: {
      role: true,
    },
  });

  if (userInOrg?.role !== "ADMIN" && userInOrg?.role !== "USER") {
    // if user has no business here, return a 404
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "no organisation found with id " + req.query.orgId });
    return;
  }

  switch (req.method) {
    case "GET":
      const allApps = await prisma.app.findMany({
        where: {
          orgId: Number(req.query.orgId),
        },
        orderBy: {
          id: "asc",
        },
      });

      res.status(StatusCodes.OK).json(
        allApps.map((app): AppDto => {
          return {
            id: app.id,
            name: app.name,
            role: userInOrg?.role,
          };
        })
      );
      break;

    case "POST":
      const generatedToken = generateToken();

      const app = await prisma.app.create({
        data: {
          name: req.body.name,
          orgId: req.body.orgId,
          publicKey: generatedToken,
        },
      });
      res.status(StatusCodes.CREATED).json(app);
      break;

    default:
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
      return;
  }
}
