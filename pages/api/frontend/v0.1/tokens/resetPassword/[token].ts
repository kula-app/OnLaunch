import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { Logger } from "../../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  switch (req.method) {
    case "GET":
      logger.log("Looking up password reset token");
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token: req.query.token as string,
        },
      });

      if (resetToken == null) {
        logger.error("Provided password reset token not found");
        res.status(StatusCodes.NOT_FOUND).json({
          message: "no token found that looks like this: " + req.query.token,
        });
        return;
      }

      if (
        resetToken &&
        (resetToken.isArchived ||
          resetToken.isObsolete ||
          resetToken.expiryDate < new Date())
      ) {
        logger.error("Provided password reset token is obsolete");
        res.status(StatusCodes.NOT_FOUND).json({
          message: "token is obsolete",
        });
        return;
      }

      res.status(StatusCodes.OK).json(resetToken);
      break;

    default:
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
      return;
  }
}
