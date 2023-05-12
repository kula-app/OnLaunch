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
import { Logger } from "../../../../../util/logger";

const prisma: PrismaClient = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const data = req.body;

  const { token, email, password } = data;

  switch (req.method) {
    case "PUT":
      if (!token || !password) {
        logger.error("No token or password provided");
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "No token or password provided" });
        return;
      }

      if (!(await validatePassword(password))) {
        logger.error("Password consists of less than 8 characters");
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: "Invalid data - password consists of less than 8 characters",
        });
        return;
      }

      logger.log("Looking up password reset token");
      const lookupToken = await prisma.passwordResetToken.findFirst({
        where: {
          token: token,
        },
      });

      if (!lookupToken) {
        logger.error("Password reset token not found");
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Password reset token not found" });
        return;
      }

      if (
        lookupToken &&
        (lookupToken.isArchived ||
          lookupToken.isObsolete ||
          lookupToken.expiryDate < new Date())
      ) {
        logger.log("Provided password reset token is obsolete");
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Please restart the password reset process!" });
        return;
      }

      const { hashedSaltedPassword, salt } = await hashAndSaltPassword(
        password
      );

      logger.log(`Updating password of user with id '${lookupToken.userId}'`);
      const updatedUser = await prisma.user.update({
        where: {
          id: lookupToken.userId,
        },
        data: {
          password: hashedSaltedPassword,
          salt: salt,
        },
      });

      logger.log("Updating password reset token as archived");
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
      logger.log(`Looking up user with email '${email}'`);
      const user = await prisma.user.findFirst({
        where: {
          email: email,
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (!user || (user && !user.id)) {
        logger.error(`No user found with email '${email}'`);
        res.status(StatusCodes.BAD_REQUEST).json({ message: "User not found" });
        return;
      }

      const generatedToken = generateToken();

      var expiryDate = new Date();
      // set expiryDate one hour from now
      expiryDate.setTime(expiryDate.getTime() + 60 * 60 * 1000);

      logger.log(
        `Updating previous password reset tokens for user with id '${user.id}' as obsolete`
      );
      await prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          isObsolete: false,
        },
        data: {
          isObsolete: true,
        },
      });

      logger.log(
        `Create new password reset token for user with id '${user.id}'`
      );
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
