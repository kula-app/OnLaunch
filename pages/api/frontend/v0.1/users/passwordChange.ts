import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/services/db";
import {
  getUserFromRequest,
  hashAndSaltPassword,
  validatePassword,
  verifyPassword,
} from "../../../../../util/auth";
import { Logger } from "../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const data = req.body;

  const { password, passwordOld } = data;

  switch (req.method) {
    case "PUT":
      const user = await getUserFromRequest(req, res);

      if (!user) {
        return;
      }

      const id = user.id;

      if (!(await validatePassword(password))) {
        logger.error("New password is too short");
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message:
            "Invalid data - new password consists of less than 8 characters",
        });
      }

      logger.log(`Looking up user with id '${id}'`);
      const userById = await prisma.user.findFirst({
        where: {
          id: Number(id),
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (!userById || (userById && !userById.id)) {
        logger.error(`No user found with id '${id}'`);
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User not found!" });
      }

      if (
        !(await verifyPassword(
          passwordOld,
          userById.salt as string,
          userById.password as string
        ))
      ) {
        logger.error("Current password is wrong");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Current password is wrong" });
      }

      const { hashedSaltedPassword: newHashedSaltedPassword, salt: newSalt } =
        await hashAndSaltPassword(password);

      logger.log(`Updating password of user with id '${id}'`);
      const updatedUser = await prisma.user.update({
        where: {
          id: userById.id,
        },
        data: {
          password: newHashedSaltedPassword,
          salt: newSalt,
        },
      });

      return res.status(StatusCodes.CREATED).json(updatedUser.email);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
