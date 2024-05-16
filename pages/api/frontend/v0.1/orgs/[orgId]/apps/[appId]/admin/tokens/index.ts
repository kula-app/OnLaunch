import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../../../../../lib/services/db";
import { getErrorDto } from "../../../../../../../../../../models/dtos/error";
import { CreateAppAdminTokenDto } from "../../../../../../../../../../models/dtos/request/createAppAdminTokenDto";
import { AppAdminTokenDto } from "../../../../../../../../../../models/dtos/response/appAdminTokenDto";
import { User } from "../../../../../../../../../../models/user";
import { encodeAppToken } from "../../../../../../../../../../util/adminApi/tokenEncoding";
import { generateToken } from "../../../../../../../../../../util/auth";
import { authenticatedHandler } from "../../../../../../../../../../util/authenticatedHandler";
import { Logger } from "../../../../../../../../../../util/logger";

const logger = new Logger(__filename);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  return authenticatedHandler(
    req,
    res,
    { method: "withRole" },
    async (req, res, user) => {
      if (user.role !== "ADMIN") {
        logger.error("User has no admin rights");
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "You are not an admin" });
      }

      switch (req.method) {
        case "GET":
          return getHandler(req, res, user);

        case "POST":
          return postHandler(req, res, user);

        default:
          return res
            .status(StatusCodes.METHOD_NOT_ALLOWED)
            .json({ message: "method not allowed" });
      }
    }
  );
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const appId = Number(req.query.appId);

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
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const requestObj = plainToInstance(CreateAppAdminTokenDto, req.body);
  const validationErrors = await validate(requestObj);
  const appId = Number(req.query.appId);

  if (validationErrors.length > 0) {
    const errors = validationErrors
      .flatMap((error) =>
        error.constraints
          ? Object.values(error.constraints)
          : ["An unknown error occurred"]
      )
      .join(", ");
    logger.error(`Validation failed: ${errors}`);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(getErrorDto(`Validation failed: ${errors}`));
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
}
