"use server";

import { BadRequestError } from "@/errors/bad-request-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import { UserEmailTakenError } from "@/errors/user-email-taken-error";
import { MailType } from "@/models/mailType";
import prisma from "@/services/db";
import { generateToken, sendTokenPerMail } from "@/util/auth";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import * as Yup from "yup";

const logger = new Logger(`actions/create-email-change-token`);

const createEmailChangeTokenSchema = Yup.object({
  email: Yup.string().email().required(),
});

export const createEmailChangeToken = createAuthenticatedServerAction(
  async (session, args: Yup.InferType<typeof createEmailChangeTokenSchema>) => {
    logger.log(
      `Creating email change token for user with id '${session.user.id}'`,
    );
    logger.verbose(`Validating arguments`);
    const { email } = await createEmailChangeTokenSchema.validate(args);

    logger.verbose(`Looking up user with id '${session.user.id}'`);
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        isDeleted: {
          not: true,
        },
      },
    });
    if (!user) {
      throw new UnauthorizedError("Authenticated user not found");
    }
    if (!user.email) {
      throw new BadRequestError("User does not have an email address");
    }

    logger.log(`Looking up user with new email '${email}'`);
    const userWithNewEmail = await prisma.user.findFirst({
      where: {
        email: email,
        NOT: {
          isDeleted: true,
        },
      },
    });

    if (userWithNewEmail) {
      logger.error(`New email '${email}' is already taken`);
      throw new UserEmailTakenError("Email address not available!");
    }

    const generatedToken = generateToken();

    // set expiryDate one hour from now
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

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
      `Creating new email change token for user with current email '${user.email}'`,
    );
    const emailToken = await prisma.emailChangeToken.create({
      data: {
        userId: user.id,
        token: generatedToken,
        expiryDate: expiryDate,
        newEmail: email,
        currentEmail: user.email,
      },
    });

    sendTokenPerMail(
      emailToken.newEmail,
      user.firstName,
      generatedToken,
      MailType.ChangeEmail,
    );

    return {
      email: user.email,
    };
  },
);
