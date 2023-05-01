import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  getUserFromRequest,
  hashAndSaltPassword,
  validatePassword,
  verifyPassword,
} from "../../../../../util/auth";
import { StatusCodes } from "http-status-codes";

const prisma: PrismaClient = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body;

  const { password, passwordOld } = data;

  switch (req.method) {
    case "PUT":
      const user = await getUserFromRequest(req, res)
    
      if (!user) {
        return;
      }

      const id = user.id;

      if (!(await validatePassword(password))) {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message:
            "Invalid data - new password consists of less than 8 characters",
        });
        return;
      }

      const userById = await prisma.user.findFirst({
        where: {
          id: Number(id),
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (!userById || (userById && !userById.id)) {
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
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Current password is wrong!" });
        return;
      }

      const { hashedSaltedPassword: newHashedSaltedPassword, salt: newSalt } =
        await hashAndSaltPassword(password);

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
