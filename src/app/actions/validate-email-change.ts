"use server";

import { BadRequestError } from "@/errors/bad-request-error";
import { NotFoundError } from "@/errors/not-found-error";
import { MailType } from "@/models/mailType";
import prisma from "@/services/db";
import { sendTokenPerMail } from "@/util/auth";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import * as Yup from "yup";

const logger = new Logger(`actions/validate-email-change`);

const validateEmailChangeSchema = Yup.object({
  token: Yup.string().required(),
});

export const validateEmailChange = createServerAction(
  async (args: Yup.InferType<typeof validateEmailChangeSchema>) => {
    logger.log(`Validating email change token`);
    const { token } = await validateEmailChangeSchema.validate(args);

    logger.log(`Looking up email change token`);
    const lookupToken = await prisma.emailChangeToken.findFirst({
      where: {
        token: token,
      },
    });

    if (!lookupToken) {
      logger.warn(`Provided email change token not found`);
      throw new NotFoundError("Email change token not found");
    }

    if (
      lookupToken.isArchived ||
      lookupToken.isObsolete ||
      lookupToken.expiryDate < new Date()
    ) {
      logger.warn(`Email change token is obsolete`);
      throw new BadRequestError("Email change token is obsolete");
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
      lookupToken.currentEmail,
      "OnLaunch user",
      "",
      MailType.EmailChanged,
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

    return {
      email: lookupToken.newEmail,
    };
  },
);
