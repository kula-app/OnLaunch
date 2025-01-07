"use server";

import { loadServerConfig } from "@/config/loadServerConfig";
import { BadRequestError } from "@/errors/bad-request-error";
import { EmailConflictError } from "@/errors/email-conflict-error";
import { UserRegistrationDisabledError } from "@/errors/user-registration-disabled-error";
import { MailType } from "@/models/mailType";
import prisma from "@/services/db";
import {
  generateToken,
  hashAndSaltPassword,
  sendTokenPerMail,
  validatePassword,
} from "@/util/auth";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { v4 as uuid } from "uuid";

const logger = new Logger(__filename);

export const signUp = createServerAction(
  async ({
    email,
    password,
    firstName,
    lastName,
  }: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const config = loadServerConfig();

    if (!config.signup.isEnabled) {
      logger.error("Signups are currently disabled");
      throw new UserRegistrationDisabledError();
    }

    if (!email || !email.includes("@")) {
      logger.error("Provided email is not valid");
      throw new BadRequestError("Email is not valid");
    }

    if (!(await validatePassword(password))) {
      logger.error("Provided password is too short");
      throw new BadRequestError("Password is too short");
    }

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
      throw new EmailConflictError();
    }

    const { hashedSaltedPassword, salt } = await hashAndSaltPassword(password);

    logger.log(`Creating new user with email '${email}'`);
    const createdUser = await prisma.user.create({
      data: {
        authId: uuid(),
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
      `Creating verification token for user with id '${createdUser.id}'`,
    );
    const verificationToken = await prisma.verificationToken.create({
      data: {
        userId: createdUser.id,
        token: generatedToken,
        expiryDate: expiryDate,
        isArchived: false,
      },
    });

    sendTokenPerMail({
      email: createdUser.email ?? email,
      firstName: createdUser.firstName,
      token: verificationToken.token,
      mailType: MailType.Verification,
    });
  },
);
