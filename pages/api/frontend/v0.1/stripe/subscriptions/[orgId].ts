import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { loadServerConfig } from "../../../../../../config/loadServerConfig";
import prisma from "../../../../../../lib/services/db";
import { User } from "../../../../../../models/user";
import { authenticatedHandler } from "../../../../../../util/authenticatedHandler";
import { Logger } from "../../../../../../util/logger";

const logger = new Logger(__filename);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  return authenticatedHandler(
    req,
    res,
    { method: "withRole" },
    async (req, res, user) => {
      const stripeConfig = loadServerConfig().stripeConfig;

      if (!stripeConfig.isEnabled) {
        logger.error("stripe is disabled but endpoint has been called");
        return res
          .status(StatusCodes.SERVICE_UNAVAILABLE)
          .json({ message: "Endpoint is disabled" });
      }

      if (user.role !== "ADMIN") {
        logger.error("User has no admin rights");
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "You are not an admin" });
      }

      const orgId = Number(req.query.orgId);

      if (!orgId) {
        logger.error("No orgId provided");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "No orgId provided" });
      }

      switch (req.method) {
        case "GET":
          return getHandler(req, res, user, orgId);

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
  orgId: number,
) {
  const subs = await prisma.subscription.findMany({
    where: {
      orgId: Number(req.query.orgId),
      isDeleted: false,
    },
    include: {
      org: true,
    },
  });

  return res.status(StatusCodes.OK).json(subs);
}
