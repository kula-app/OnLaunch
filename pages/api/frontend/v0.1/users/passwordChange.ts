import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  getUserFromRequest,
  hashAndSaltPassword,
  validatePassword,
  verifyPassword,
} from "../../../../../util/auth";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../../../../util/logger";

const prisma: PrismaClient = new PrismaClient();

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
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message:
            "Invalid data - new password consists of less than 8 characters",
        });
        return;
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
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User not found!" });
        return;
      }

      if (
        !(await verifyPassword(
          passwordOld,
          userById.salt as string,
          userById.password as string
        ))
      ) {
        logger.error("Current password is wrong");
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Current password is wrong" });
        return;
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

      res.status(StatusCodes.CREATED).json(updatedUser.email);
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
