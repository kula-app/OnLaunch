import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token: req.query.token as string,
        },
      });

      if (resetToken == null) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({
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
        res
          .status(StatusCodes.NOT_FOUND)
          .json({
            message: "no token found that looks like this: " + req.query.token,
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
