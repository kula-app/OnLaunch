import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { generateToken, getUserWithRoleFromRequest } from "../../../../../../../util/auth";
import { StatusCodes } from "http-status-codes";

const prisma: PrismaClient = new PrismaClient();

type AppDto = {
  id: number;
  name: string;
  role: string;
  activeMessages: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getUserWithRoleFromRequest(req, res, prisma);

  if (!user) {
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
        include: {
          messages: {
            where: {
              AND: [
                {
                  startDate: {
                    lte: new Date(),
                  },
                },
                {
                  endDate: {
                    gte: new Date(),
                  },
                },
              ],
            },
          },
        },
      });

      res.status(StatusCodes.OK).json(
        allApps.map((app): AppDto => {
          return {
            id: app.id,
            name: app.name,
            role: user.role,
            activeMessages: app.messages.length,
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
