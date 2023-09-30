import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../../lib/services/db";
import {
  generateToken,
  getUserWithRoleFromRequest,
} from "../../../../../../../util/auth";
import { Logger } from "../../../../../../../util/logger";

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
  const logger = new Logger(__filename);

  const user = await getUserWithRoleFromRequest(req, res);

  if (!user) {
    return;
  }

  switch (req.method) {
    case "GET":
      const org = await prisma.organisation.findFirst({
        where: {
          id: Number(req.query.orgId),
          isDeleted: false,
        },
      });

      if (!org) {
        logger.error(
          `Organisation with id '${req.query.orgId}' has been deleted or not found`
        );
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `Organisation with id '${req.query.orgId}' not found`,
        });
      }

      logger.log(`Looking up apps with org id '${req.query.orgId}'`);
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

      logger.log(
        `Creating app '${req.body.name}' for org id '${req.query.orgId}'`
      );
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
