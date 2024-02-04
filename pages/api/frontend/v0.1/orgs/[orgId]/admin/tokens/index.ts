import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../../../lib/services/db";
import { OrgAdminTokenDto } from "../../../../../../../../models/dtos/orgAdminTokenDto";
import { encodeOrgToken } from "../../../../../../../../util/adminApi/tokenEncoding";
import {
  generateToken,
  getUserWithRoleFromRequest,
} from "../../../../../../../../util/auth";
import { Logger } from "../../../../../../../../util/logger";

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
        orgAdminTokens.map((orgAdminToken): OrgAdminTokenDto => {
          return {
            id: orgAdminToken.id,
            createdAt: orgAdminToken.createdAt,
            updatedAt: orgAdminToken.updatedAt,
            token: encodeOrgToken(orgAdminToken.token),
            role: orgAdminToken.role,
            label: orgAdminToken.label ? orgAdminToken.label : "",
          };
        })
      );

    case "POST":
      const label = req.body.label;

      const generatedToken = generateToken();

      logger.log(`Creating new organisation admin token for org id '${orgId}'`);
      const orgAdminToken = await prisma.organisationAdminToken.create({
        data: {
          token: generatedToken,
          orgId: orgId,
          // Only add label data when the parameter was actually passed via body
          ...(label && { label: label }),
        },
      });

      const dto: OrgAdminTokenDto = {
        id: orgAdminToken.id,
        createdAt: orgAdminToken.createdAt,
        updatedAt: orgAdminToken.updatedAt,
        token: encodeOrgToken(orgAdminToken.token),
        label: orgAdminToken.label,
        role: orgAdminToken.role,
      };

      return res.status(StatusCodes.CREATED).json(dto);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
