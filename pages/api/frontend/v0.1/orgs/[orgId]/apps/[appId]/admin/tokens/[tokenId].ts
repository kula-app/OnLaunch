import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../../../../../lib/services/db";
import { AppAdminTokenDto } from "../../../../../../../../../../models/dtos/response/appAdminTokenDto";
import { User } from "../../../../../../../../../../models/user";
import { encodeAppToken } from "../../../../../../../../../../util/adminApi/tokenEncoding";
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
        case "DELETE":
          return deleteHandler(req, res, user);

        default:
          return res
            .status(StatusCodes.METHOD_NOT_ALLOWED)
            .json({ message: "method not allowed" });
      }
    }
  );
}

async function deleteHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const appId = Number(req.query.appId);
  const tokenId = Number(req.query.tokenId);

  try {
    logger.log(`Deleting app admin token for org id '${appId}'`);
    const appAdminToken = await prisma.appAdminToken.update({
      where: {
        id: tokenId,
        appId: appId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });

    const dto: AppAdminTokenDto = {
      id: appAdminToken.id,
      createdAt: appAdminToken.createdAt,
      updatedAt: appAdminToken.updatedAt,
      token: encodeAppToken(appAdminToken.token),
      role: appAdminToken.role,
      label: appAdminToken.label ?? undefined,
    };

    return res.status(StatusCodes.OK).json(dto);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`No app admin token found with id '${tokenId}'`);
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `No app admin token found with id '${tokenId}'` });
    }

    logger.error(`Internal server error occurred: ${e}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An internal server error occurred - please try again later!",
    });
  }
}
