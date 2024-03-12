import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../../../../../lib/services/db";
import { CreateAppAdminTokenDto } from "../../../../../../../../../../models/dtos/request/createAppAdminTokenDto";
import { AppAdminTokenDto } from "../../../../../../../../../../models/dtos/response/appAdminTokenDto";
import { encodeAppToken } from "../../../../../../../../../../util/adminApi/tokenEncoding";
import {
  generateToken,
  getUserWithRoleFromRequest,
} from "../../../../../../../../../../util/auth";
import { Logger } from "../../../../../../../../../../util/logger";

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

  const appId = Number(req.query.appId);

  switch (req.method) {
    case "GET":
      logger.log(`Looking up appAdminTokens for app with id(=${appId})`);
      const appAdminTokens = await prisma.appAdminToken.findMany({
        where: {
          appId: appId,
          isDeleted: false,
          role: {
            not: "TEMP",
          },
          OR: [
            {
              expiryDate: null,
            },
            {
              expiryDate: {
                gt: new Date(),
              },
            },
          ],
        },
      });

      return res.status(StatusCodes.OK).json(
        appAdminTokens.map((appAdminToken): AppAdminTokenDto => {
          return {
            id: appAdminToken.id,
            createdAt: appAdminToken.createdAt,
            updatedAt: appAdminToken.updatedAt,
            token: encodeAppToken(appAdminToken.token),
            role: appAdminToken.role,
            label: appAdminToken.label ? appAdminToken.label : "",
            expiryDate: appAdminToken.expiryDate
              ? appAdminToken.expiryDate
              : undefined,
          };
        })
      );

    case "POST":
      const requestObj = plainToInstance(CreateAppAdminTokenDto, req.body);
      const errors = await validate(requestObj);

      if (errors.length > 0) {
        logger.error("Invalid time to live");
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Invalid time to live" });
      }

      const { timeToLive, label } = requestObj;

      const generatedToken = generateToken();

      const expiryDate =
        timeToLive === 0 ? null : new Date(Date.now() + timeToLive * 1000);

      logger.log(`Creating new app admin token for app id '${appId}'`);
      const appAdminToken = await prisma.appAdminToken.create({
        data: {
          token: generatedToken,
          expiryDate: expiryDate,
          label: label,
          app: {
            connect: {
              id: appId,
            },
          },
        },
      });

      const dto: AppAdminTokenDto = {
        id: appAdminToken.id,
        createdAt: appAdminToken.createdAt,
        updatedAt: appAdminToken.updatedAt,
        token: encodeAppToken(appAdminToken.token),
        role: appAdminToken.role,
        label: appAdminToken.label ?? undefined,
        expiryDate: appAdminToken.expiryDate ?? undefined,
      };

      return res.status(StatusCodes.CREATED).json(dto);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
