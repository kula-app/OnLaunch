"use server";

import prisma from "@/lib/services/db";
import { MailType } from "@/models/mailType";
import { generateToken, sendTokenPerMail } from "@/util/auth";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { NotFoundError } from "../../errors/not-found-error";

const logger = new Logger(__filename);

export const requestPasswordResetEmail = createServerAction(
  async (email: string) => {
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
      logger.error(`User with email '${email}' not found`);
      throw new NotFoundError(`User with email '${email}' not found`);
    }

    const generatedToken = generateToken();

    // set expiryDate one hour from now
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

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

    logger.log(`Create new password reset token for user with id '${user.id}'`);
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: generatedToken,
        expiryDate: expiryDate,
      },
    });

    logger.log(`Sending password reset token to user with email '${email}'`);
    sendTokenPerMail(
      user.email ?? email,
      user.firstName,
      generatedToken,
      MailType.ResetPassword
    );
    logger.log(`Password reset token sent to user with email '${email}'`);
  }
);
