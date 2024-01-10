import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../../lib/services/db";
import { OrgAdminToken } from "../../../../../../../models/orgAdminToken";
import {
  generateToken,
  getUserWithRoleFromRequest,
} from "../../../../../../../util/auth";
import { Logger } from "../../../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const user = await getUserWithRoleFromRequest(req, res);

  if (!user) {
    return;
  }

  if (user.role !== "ADMIN") {
    logger.error("User has no admin rights");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "You are not an admin" });
  }

  const orgId = Number(req.query.orgId);

  switch (req.method) {
    case "GET":
      logger.log(`Looking up orgAdminTokens for org with id(=${orgId})`);
      const orgAdminTokens = await prisma.organisationAdminToken.findMany({
        where: {
          orgId: orgId,
          isDeleted: false,
        },
      });

      return res.status(StatusCodes.OK).json(
        orgAdminTokens.map((orgAdminToken): OrgAdminToken => {
          return {
            id: orgAdminToken.id,
            token: orgAdminToken.token,
            role: orgAdminToken.role,
          };
        })
      );

    case "POST":
      const generatedToken = generateToken();

      logger.log(`Creating new organisation admin token for org id '${orgId}'`);
      const orgAdminToken = await prisma.organisationAdminToken.create({
        data: {
          token: `org_${generatedToken}`,
          orgId: orgId,
        },
      });

      return res.status(StatusCodes.CREATED).json(orgAdminToken);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
