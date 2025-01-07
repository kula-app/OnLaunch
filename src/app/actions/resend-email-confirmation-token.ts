"use server";

import { BadRequestError } from "@/errors/bad-request-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import { MailType } from "@/models/mailType";
import prisma from "@/services/db";
import { sendTokenPerMail } from "@/util/auth";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger(`actions/resend-email-change-token`);

export const resendEmailConfirmationToken = createAuthenticatedServerAction(
  async (session) => {
    logger.log(
      `Resending email change token for user with id '${session.user.id}'`,
    );
    logger.verbose(`Looking up user with id '${session.user.id}'`);
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        isDeleted: {
          not: true,
        },
      },
      include: {
        emailChangeToken: {
          where: {
            isArchived: {
              not: true,
            },
            isObsolete: {
              not: true,
            },
            expiryDate: {
              gt: new Date(),
            },
          },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedError("Authenticated user not found");
    }
    if (!user.email) {
      throw new BadRequestError("User does not have an email address");
    }
    if (!user.emailChangeToken?.[0]) {
      throw new BadRequestError("No pending email change request found");
    }

    logger.log(
      `Sending email change token to new email address: ${user.emailChangeToken[0].newEmail}`,
    );
    sendTokenPerMail({
      email: user.emailChangeToken[0].newEmail,
      firstName: user.firstName,
      token: user.emailChangeToken[0].token,
      mailType: MailType.ChangeEmail,
    });
    logger.log(`Email change token sent successfully`);
  },
);
