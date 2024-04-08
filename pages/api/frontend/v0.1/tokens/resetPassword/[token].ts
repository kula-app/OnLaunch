import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { Logger } from "../../../../../../util/logger";

const logger = new Logger(__filename);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return await getHandler(req, res);

    default:
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
      return;
  }
}

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  logger.log("Looking up password reset token");
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      token: req.query.token as string,
    },
  });

  if (resetToken == null) {
    logger.error("Provided password reset token not found");
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "no token found that looks like this: " + req.query.token,
    });
  }

  if (
    resetToken &&
    (resetToken.isArchived ||
      resetToken.isObsolete ||
      resetToken.expiryDate < new Date())
  ) {
    logger.error("Provided password reset token is obsolete");
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "token is obsolete",
    });
  }

  return res.status(StatusCodes.OK).json(resetToken);
}
