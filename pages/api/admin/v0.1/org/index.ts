import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/services/db";
import { AppDto } from "../../../../../models/dtos/response/appDto";
import { OrgDto } from "../../../../../models/dtos/response/orgDto";
import { authenticate } from "../../../../../util/adminApi/auth";
import { Logger } from "../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const authResult = await authenticate(req, "org");

  // When authResult was not successful, return error with respective
  // code and message
  if (!authResult.success)
    return res
      .status(authResult.statusCode)
      .json({ message: authResult.errorMessage });

  switch (req.method) {
    // Find org (including apps) by token
    // If found, return org data with apps
    case "GET":
      logger.log(`Looking up organisation with id(='${authResult.id}')`);

      const org = await prisma.organisation.findUnique({
        where: {
          id: authResult.id,
          isDeleted: false,
        },
        include: {
          apps: true,
        },
      });

      if (org == null) {
        logger.error(`No organisation found with id '${authResult.id}'`);
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `No organisation found with id '${authResult.id}'`,
        });
      }

      const convertedApps: AppDto[] = org.apps.map(
        (app): AppDto => ({
          id: app.id,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          name: app.name,
          publicKey: app.publicKey,
        })
      );
      const dto: OrgDto = {
        id: org.id,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        name: org.name,
        apps: convertedApps,
      };

      return res.status(StatusCodes.OK).json(dto);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
