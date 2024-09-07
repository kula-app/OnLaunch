"use server";

import prisma from "@/services/db";
import { hashAndSaltPassword, validatePassword } from "@/util/auth";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { NotFoundError } from "../../errors/not-found-error";
import { TokenExpiredError } from "../../errors/token-expired-error";
import { TokenObsoleteError } from "../../errors/token-obsolete-error";
import { TokenUsedError } from "../../errors/token-used-error";
import { ValidationError } from "../../errors/validation-error";

const logger = new Logger(__filename);

export const resetPassword = createServerAction(
  async ({ token, password }: { token: string; password: string }) => {
    logger.log("Validating password");
    if (!(await validatePassword(password))) {
      logger.error("Password consists of less than 8 characters");
      throw new ValidationError("Password consists of less than 8 characters");
    }

    logger.log("Looking up password reset token");
    const lookupToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: token,
      },
    });

    if (!lookupToken) {
      logger.error("Password reset token not found");
      throw new NotFoundError("Password reset token not found");
    }
    if (lookupToken.isArchived) {
      logger.warn("Password reset token already used");
      throw new TokenUsedError();
    }
    if (lookupToken.isObsolete) {
      logger.warn("Password reset token is obsolete");
      throw new TokenObsoleteError();
    }
    if (lookupToken.expiryDate < new Date()) {
      logger.warn("Password reset token is expired");
      throw new TokenExpiredError();
    }

    const { hashedSaltedPassword, salt } = await hashAndSaltPassword(password);

    logger.log(`Updating password of user with id '${lookupToken.userId}'`);
    const updatedUser = await prisma.user.update({
      where: {
        id: lookupToken.userId,
      },
      data: {
        password: hashedSaltedPassword,
        salt: salt,
      },
    });

    logger.log("Updating password reset token as archived");
    await prisma.passwordResetToken.update({
      where: {
        id: lookupToken.id,
      },
      data: {
        isArchived: true,
      },
    });

    return updatedUser;
  },
);
