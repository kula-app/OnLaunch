import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  generateToken,
  sendTokenPerMail,
  hashAndSaltPassword,
  validatePassword,
} from "../../../../../util/auth";
import { StatusCodes } from "http-status-codes";
import { MailType } from "../../../../../models/mailType";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body;

  const { token, email, password } = data;

  switch (req.method) {
    case "PUT":
      if (!token || !password) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "No token or token provided!" });
        return;
      }

      if (!(await validatePassword(password))) {
        res
          .status(StatusCodes.UNPROCESSABLE_ENTITY)
          .json({
            message:
              "Invalid data - password consists of less than 8 characters",
          });
        return;
      }

      const lookupToken = await prisma.passwordResetToken.findFirst({
        where: {
          token: token,
        },
      });

      if (!lookupToken) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "PasswordReset token not found!" });
        return;
      }

      if (
        lookupToken &&
        (lookupToken.isArchived ||
          lookupToken.isObsolete ||
          lookupToken.expiryDate < new Date())
      ) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Please restart the password reset process!" });
        return;
      }

      const { hashedSaltedPassword, salt } = await hashAndSaltPassword(
        password
      );

      const updatedUser = await prisma.user.update({
        where: {
          id: lookupToken.userId,
        },
        data: {
          password: hashedSaltedPassword,
          salt: salt,
        },
      });

      await prisma.passwordResetToken.update({
        where: {
          id: lookupToken.id,
        },
        data: {
          isArchived: true,
        },
      });

      res.status(StatusCodes.OK).json(updatedUser);
      break;

    case "POST":
      const user = await prisma.user.findFirst({
        where: {
          email: email,
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (!user || (user && !user.id)) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User not found!" });
        return;
      }

      const generatedToken = generateToken();

      var expiryDate = new Date();
      // set expiryDate one hour from now
      expiryDate.setTime(expiryDate.getTime() + 60 * 60 * 1000);

      await prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          isObsolete: false,
        },
        data: {
          isObsolete: true,
        },
      });

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: generatedToken,
          expiryDate: expiryDate,
        },
      });

      sendTokenPerMail(
        user.email as string,
        user.firstName as string,
        generatedToken,
        MailType.ResetPassword
      );

      res.status(StatusCodes.OK).json(user);
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
