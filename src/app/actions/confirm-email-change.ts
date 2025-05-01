"use server";

import { NotFoundError } from "@/errors/not-found-error";
import { TokenExpiredError } from "@/errors/token-expired-error";
import { TokenObsoleteError } from "@/errors/token-obsolete-error";
import { TokenUsedError } from "@/errors/token-used-error";
import { MailType } from "@/models/mailType";
import prisma from "@/services/db";
import { sendTokenPerMail } from "@/util/auth";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import * as Yup from "yup";

const logger = new Logger(`actions/confirm-email-change`);

const confirmEmailChangeSchema = Yup.object({
  token: Yup.string().required(),
});

export const confirmEmailChange = createServerAction(
  async (args: Yup.InferType<typeof confirmEmailChangeSchema>) => {
    logger.log(`Validating email confirmation token`);
    const { token } = await confirmEmailChangeSchema.validate(args);

    logger.log(`Looking up email confirmation token`);
    const lookupToken = await prisma.emailChangeToken.findFirst({
      where: {
        token: token,
      },
    });
    if (!lookupToken) {
      logger.warn(`Provided email confirmation token not found`);
      throw new NotFoundError("Email confirmation token not found");
    }
    if (lookupToken.isArchived) {
      logger.warn(`email confirmation token is archived`);
      throw new TokenUsedError(
        "Email confirmation token has already been used",
      );
    }
    if (lookupToken.isObsolete) {
      logger.warn(`email confirmation token is obsolete`);
      throw new TokenObsoleteError("Email confirmation token is obsolete");
    }
    if (lookupToken.expiryDate < new Date()) {
      logger.warn(`email confirmation token has expired`);
      throw new TokenExpiredError("Email confirmation token has expired");
    }

    logger.log(`Looking up user with id '${lookupToken.userId}'`);
    const user = await prisma.user.findUnique({
      where: {
        id: lookupToken.userId,
      },
    });
    if (!user) {
      logger.error("User not found");
      throw new NotFoundError("User not found");
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

    logger.log(`Updating email confirmation token as archived`);
    await prisma.emailChangeToken.update({
      where: {
        id: lookupToken.id,
      },
      data: {
        isArchived: true,
      },
    });

    logger.log(`Sending notification to new email address`);
    sendTokenPerMail({
      email: lookupToken.currentEmail,
      firstName: user.firstName,
      token: "",
      mailType: MailType.EmailChanged,
    });

    return {
      email: lookupToken.newEmail,
    };
  },
);
