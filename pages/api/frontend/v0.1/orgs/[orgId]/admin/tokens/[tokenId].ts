import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../../../lib/services/db";
import { OrgAdminTokenDto } from "../../../../../../../../models/dtos/orgAdminTokenDto";
import { encodeOrgToken } from "../../../../../../../../util/adminApi/tokenEncoding";
import { getUserWithRoleFromRequest } from "../../../../../../../../util/auth";
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
  const tokenId = Number(req.query.tokenId);

  switch (req.method) {
    case "DELETE":
      try {
        logger.log(`Deleting organisation admin token for org id '${orgId}'`);
        const orgAdminToken = await prisma.organisationAdminToken.update({
          where: {
            id: tokenId,
            orgId: orgId,
            isDeleted: false,
          },
          data: {
            isDeleted: true,
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

        return res.status(StatusCodes.OK).json(dto);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          logger.error(`No org admin token found with id '${tokenId}'`);
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: `No org admin token found with id '${tokenId}'` });
        }

        logger.error(`Internal server error occurred: ${e}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message:
            "An internal server error occurred - please try again later!",
        });
      }

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
