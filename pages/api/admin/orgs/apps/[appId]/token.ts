import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { authenticate } from "../../../../../../util/adminApi/auth";
import { decodeToken } from "../../../../../../util/adminApi/tokenDecoding";
import { generateToken } from "../../../../../../util/auth";
import { Logger } from "../../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const authToken = await authenticate(req, res, "org");

  // When no authToken has been returned, then the NextApiResponse
  // has already ended with an error
  if (!authToken) return;

  const tokenInfo = decodeToken(authToken);

  const appId = Number(req.query.appId);

  // The (app) id provided in the token has to match the app id of the query path
  if (!tokenInfo || !appId || tokenInfo.id !== appId) {
    logger.error(`Wrong token provided for app with id(=${appId})`);
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: `Wrong token provided for app with id(=${appId})`,
    });
  }

  switch (req.method) {
    // Create new magic AppAdminToken for app
    case "POST":
      if (!appId) {
        logger.error("No appId parameter provided for app!");
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "No appId parameter provided for app!",
        });
      }

      // Check whether the app is part of the organisation
      const appFromDb = await prisma.app.findFirst({
        where: {
          id: appId,
          orgId: tokenInfo?.id,
        },
      });

      if (!appFromDb) {
        logger.error(
          `No app with id(=${appId}) found for org with id(=${tokenInfo?.id}!`
        );
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `No app with id(=${appId}) found for org with id(=${tokenInfo?.id}!`,
        });
      }

      logger.log(`Creating magic AppAdminToken for app with id(='${appId}'`);

      const generatedToken = generateToken();

      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 5);

      const appAdminToken = await prisma.appAdminToken.create({
        data: {
          token: `app_${appId}_${generatedToken}`,
          role: "MAGIC",
          expiryDate: expiryDate,
          appId: appId,
        },
      });

      return res.status(StatusCodes.CREATED).json(appAdminToken);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
