import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { loadConfig } from "../../../../../config/loadConfig";
import { MailType } from "../../../../../models/mailType";
import {
  generateToken,
  hashAndSaltPassword,
  sendTokenPerMail,
  validatePassword,
} from "../../../../../util/auth";
import { Logger } from "../../../../../util/logger";

const prisma: PrismaClient = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const config = loadConfig();

  switch (req.method) {
    case "POST":
      const data = req.body;

      const { email, password, firstName, lastName } = data;

      if (!config.signup.isEnabled) {
        logger.error("Signups are currently disabled");
        res
          .status(StatusCodes.METHOD_NOT_ALLOWED)
          .json({ message: "Not allowed - signups are currently disabled!" });
        return;
      }

      if (!email || !email.includes("@")) {
        logger.error("Provided email is not valid");
        res
          .status(StatusCodes.UNPROCESSABLE_ENTITY)
          .json({ message: "Invalid data - email is not valid" });
        return;
      }

      if (!(await validatePassword(password))) {
        logger.error("Provided password is too short");
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: "Invalid data - password consists of less than 8 characters",
        });
        return;
      }

      logger.log(`Looking up user with email '${email}'`);
      const lookupUser = await prisma.user.findFirst({
        where: {
          email: email,
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (lookupUser) {
        logger.error(`Email '${email}' is already in use`);
        res
          .status(StatusCodes.CONFLICT)
          .json({ message: "Conflict - email already in use" });
        return;
      }

      const { hashedSaltedPassword, salt } = await hashAndSaltPassword(
        password
      );

      logger.log(`Creating new user with email '${email}'`);
      const createdUser = await prisma.user.create({
        data: {
          email: email,
          password: hashedSaltedPassword,
          salt: salt,
          firstName: firstName,
          lastName: lastName,
          isVerified: false,
        },
      });

      const generatedToken = generateToken();

      var expiryDate = new Date();
      // set expiryDate one week from now
      expiryDate.setDate(expiryDate.getDate() + 7);

      logger.log(
        `Creating verification token for user with id '${createdUser.id}'`
      );
      const verificationToken = await prisma.verificationToken.create({
        data: {
          userId: createdUser.id,
          token: generatedToken,
          expiryDate: expiryDate,
          isArchived: false,
        },
      });

      sendTokenPerMail(
        createdUser.email as string,
        createdUser.firstName as string,
        verificationToken.token,
        MailType.Verification
      );

      res.status(StatusCodes.CREATED).json(email);
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
