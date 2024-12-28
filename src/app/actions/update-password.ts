"use server";

import { UnauthorizedError } from "@/errors/unauthorized-error";
import prisma from "@/services/db";
import { hashAndSaltPassword, verifyPassword } from "@/util/auth";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import * as Yup from "yup";

const updatePasswordSchema = Yup.object({
  password: Yup.string().min(8, "").required(),
  passwordOld: Yup.string().min(8).required(),
});

const logger = new Logger(`actions/update-password`);

export const updatePassword = createAuthenticatedServerAction(
  async (session, args: Yup.InferType<typeof updatePasswordSchema>) => {
    logger.log(`Updating password for user with id '${session.user.id}'`);

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

    const { password, passwordOld } = await updatePasswordSchema.validate(args);

    if (
      !(await verifyPassword(passwordOld, user.salt ?? "", user.password ?? ""))
    ) {
      logger.warn("Current password is wrong");
      throw new UnauthorizedError("Current password is wrong");
    }

    const { hashedSaltedPassword: newHashedSaltedPassword, salt: newSalt } =
      await hashAndSaltPassword(password);

    logger.verbose(`Updating password of user with id '${user.id}'`);
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: newHashedSaltedPassword,
        salt: newSalt,
      },
    });
    logger.log(`Password updated for user with id '${user.id}'`);

    return {
      email: updatedUser.email,
    };
  },
);
