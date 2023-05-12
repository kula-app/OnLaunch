import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  getUserFromRequest,
  generateToken,
  sendTokenPerMail,
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

  const { emailNew, token } = data;

  switch (req.method) {
    case "POST":
      const user = await getUserFromRequest(req, res);

      if (!user) {
        return;
      }

      if (!emailNew || !emailNew.includes("@")) {
        logger.error("Email is not valid");
        res
          .status(StatusCodes.UNPROCESSABLE_ENTITY)
          .json({ message: "Invalid data - email not valid" });
        return;
      }

      logger.log(`Looking up user with email '${user.email}'`);
      const userByEmail = await prisma.user.findFirst({
        where: {
          email: user.email,
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (!userByEmail || (userByEmail && !userByEmail.id)) {
        logger.error(`No user found with email '${user.email}'`);
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User not found!" });
        return;
      }

      logger.log(`Looking up user with new email '${emailNew}'`);
      const userWithNewEmail = await prisma.user.findFirst({
        where: {
          email: emailNew,
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (userWithNewEmail) {
        logger.error(`New email '${emailNew}' is already taken`);
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Email address not available!" });
        return;
      }

      const generatedToken = generateToken();

      var expiryDate = new Date();
      // set expiryDate one hour from now
      expiryDate.setTime(expiryDate.getTime() + 60 * 60 * 1000);

      logger.log(`Updating previous email change tokens obsolete`);
      await prisma.emailChangeToken.updateMany({
        where: {
          userId: user.id,
          isObsolete: false,
        },
        data: {
          isObsolete: true,
        },
      });

      logger.log(
        `Creating new email change token for user with current email '${user.email}'`
      );
      const emailToken = await prisma.emailChangeToken.create({
        data: {
          userId: user.id,
          token: generatedToken,
          expiryDate: expiryDate,
          newEmail: emailNew,
          currentEmail: user.email,
        },
      });

      sendTokenPerMail(
        emailToken.newEmail as string,
        userByEmail.firstName as string,
        generatedToken,
        MailType.ChangeEmail
      );

      res.status(StatusCodes.CREATED).json(user.email);
      break;

    case "PUT":
      logger.log(`Looking up email change token`);
      const lookupToken = await prisma.emailChangeToken.findFirst({
        where: {
          token: token,
        },
      });

      if (!lookupToken) {
        logger.error(`Provided email change token not found`);
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Email change token not found" });
        return;
      }

      if (
        lookupToken &&
        (lookupToken.isArchived ||
          lookupToken.isObsolete ||
          lookupToken.expiryDate < new Date())
      ) {
        logger.error(`Email change token is obsolete`);
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Email change token is obsolete!" });
        return;
      }

      logger.log(`Updating email of user with id '${lookupToken.userId}'`);
      await prisma.user.update({
        where: {
          id: lookupToken.userId,
        },
        data: {
          email: lookupToken.newEmail,
        },
      });

      sendTokenPerMail(
        lookupToken.currentEmail as string,
        "OnLaunch user",
        "",
        MailType.EmailChanged
      );

      logger.log(`Updating email change token as archived`);
      await prisma.emailChangeToken.update({
        where: {
          id: lookupToken.id,
        },
        data: {
          isArchived: true,
        },
      });

      res.status(StatusCodes.OK).json(lookupToken.newEmail);
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
