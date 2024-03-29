import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { loadConfig } from "../../../../../../config/loadConfig";
import prisma from "../../../../../../lib/services/db";
import { getUserWithRoleFromRequest } from "../../../../../../util/auth";
import { Logger } from "../../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);
  const stripeConfig = loadConfig().server.stripeConfig;

  if (!stripeConfig.isEnabled) {
    logger.error("stripe is disabled but endpoint has been called");
    return res
      .status(StatusCodes.SERVICE_UNAVAILABLE)
      .json({ message: "Endpoint is disabled" });
  }

  const userInOrg = await getUserWithRoleFromRequest(req, res);

  if (!userInOrg) {
    return;
  }

  if (userInOrg.role !== "ADMIN") {
    logger.error("User has no admin rights");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "You are not an admin" });
  }

  if (!req.query.orgId) {
    logger.error("No orgId provided");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No orgId provided" });
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

      return res.status(StatusCodes.OK).json(subs);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
