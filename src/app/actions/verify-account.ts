"use server";

import prisma from "@/services/db";
import { Logger } from "@/util/logger";
import { NotFoundError } from "../../errors/not-found-error";
import { TokenExpiredError } from "../../errors/token-expired-error";
import { TokenObsoleteError } from "../../errors/token-obsolete-error";
import { UserAlreadyVerifiedError } from "../../errors/user-already-verified-error";
import { createServerAction } from "../../util/create-server-action";

const logger = new Logger(__filename);

export const verifyEmail = createServerAction(
  async (email: string, token: string) => {
    logger.log(`Looking up verification token`);
    const lookupToken = await prisma.verificationToken.findFirst({
      where: {
        token: token,
      },
    });

    if (!lookupToken) {
      logger.error("Provided verification token not found");
      throw new NotFoundError("Verification token not found");
    }

    if (lookupToken && lookupToken.isArchived) {
      logger.error("User already verified");
      throw new UserAlreadyVerifiedError("User already verified");
    }

    if (lookupToken && lookupToken.isObsolete) {
      logger.error("Verification token is obsolete");
      throw new TokenObsoleteError("Verification token is obsolete");
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

    if (user.isVerified) {
      logger.error("User already verified");
      throw new UserAlreadyVerifiedError("User already verified");
    }

    // if token expired and user not verified, throw error
    if (lookupToken && lookupToken.expiryDate < new Date()) {
      logger.error("Provided verification token has expired");
      throw new TokenExpiredError("Verification token has expired");
    }

    logger.log(`Updating user with id '${lookupToken.userId}' as verified`);
    await prisma.user.update({
      where: {
        id: lookupToken.userId,
      },
      data: {
        isVerified: true,
      },
    });

    logger.log(`Updating verification token as archived`);
    await prisma.verificationToken.update({
      where: {
        id: lookupToken.id,
      },
      data: {
        isArchived: true,
      },
    });
  },
);
