import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { AppAdminTokenDto } from "../../../../../../models/dtos/response/appAdminTokenDto";
import { authenticate } from "../../../../../../util/adminApi/auth";
import { encodeAppToken } from "../../../../../../util/adminApi/tokenEncoding";
import { generateToken } from "../../../../../../util/auth";
import { Logger } from "../../../../../../util/logger";

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

  const appId = Number(req.query.appId);

  if (!appId) {
    logger.error(`No app id provided!`);
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: `No app id provided!`,
    });
  }

  switch (req.method) {
    // Create new magic AppAdminToken for app
    case "POST":
      // Check whether the app is part of the organisation
      const appFromDb = await prisma.app.findFirst({
        where: {
          id: appId,
          orgId: authResult.id,
        },
      });

      if (!appFromDb) {
        logger.error(
          `No app with id(=${appId}) found for org with id(=${authResult.id}!`
        );
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `No app with id(=${appId}) found for org with id(=${authResult.id}!`,
        });
      }

      logger.log(
        `Creating temporary AppAdminToken for app with id(='${appId}')`
      );

      const generatedToken = generateToken();

      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 5);

      const appAdminToken = await prisma.appAdminToken.create({
        data: {
          token: generatedToken,
          role: "TEMP",
          expiryDate: expiryDate,
          appId: appId,
        },
      });

      const dto: AppAdminTokenDto = {
        id: appAdminToken.id,
        createdAt: appAdminToken.createdAt,
        updatedAt: appAdminToken.updatedAt,
        token: encodeAppToken(appAdminToken.token),
        role: appAdminToken.role,
        ...(appAdminToken.label && { label: appAdminToken.label }),
        expiryDate: expiryDate,
      };

      return res.status(StatusCodes.CREATED).json(dto);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
