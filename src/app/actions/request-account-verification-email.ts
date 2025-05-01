"use server";

import { MailType } from "@/models/mailType";
import prisma from "@/services/db";
import { generateToken, sendTokenPerMail } from "@/util/auth";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { NotFoundError } from "../../errors/not-found-error";
import { UserAlreadyVerifiedError } from "../../errors/user-already-verified-error";

const logger = new Logger(__filename);

export const requestAccountVerificationEmail = createServerAction(
  async (email: string) => {
    logger.log(`Looking up user with email '${email}'`);
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      logger.error(`User with email '${email}' not found`);
      throw new NotFoundError(`User with email '${email}' not found`);
    }

    if (user.isVerified) {
      logger.error("User already verified");
      throw new UserAlreadyVerifiedError();
    }

    const generatedToken = generateToken();

    var expiryDate = new Date();
    // set expiryDate one week from now
    expiryDate.setDate(expiryDate.getDate() + 7);

    logger.log(
      `Updating previos verification tokens for user with id '${user.id}' as obsolete`,
    );
    await prisma.verificationToken.updateMany({
      where: {
        userId: user.id,
        isObsolete: false,
        updatedAt: new Date(),
      },
      data: {
        isObsolete: true,
      },
    });

    logger.log(`Create new verification token for user with id '${user.id}'`);
    const verificationToken = await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: generatedToken,
        expiryDate: expiryDate,
        isArchived: false,
      },
    });

    sendTokenPerMail({
      email: user.email ?? email,
      firstName: user.firstName,
      token: verificationToken.token,
      mailType: MailType.Verification,
    });
    logger.log(
      `Verification email sent for user with id '${user.id}' to email '${user.email}'`,
    );
  },
);
