import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../../util/logger";
import { REQUEST_TIMEOUT, StatusCodes } from "http-status-codes";
import { getUserWithRoleFromRequest } from "../../../../../../util/auth";
import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const userInOrg = await getUserWithRoleFromRequest(req, res, prisma);

  if (!userInOrg) {
    logger.error("User not logged in");
    return;
  }

  if (userInOrg.role !== "ADMIN") {
    logger.error("User has no admin rights");
    return;
  }

  if (!req.query.orgId) {
    logger.error("No orgId provided");
    return;
  }

  switch (req.method) {
    // get subscription data for logged in user
    case "GET":
      const subs = await prisma.subscription.findMany({
        where: {
          orgId: Number(req.query.orgId),
          isDeleted: false,
        },
        include: {
          org: true,
        },
      });

      res.status(StatusCodes.OK).json(subs);
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
