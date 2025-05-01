"use server";

import type { User } from "@/models/user";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import type { Session } from "next-auth";

const logger = new Logger("actions/get-user");

export const getUser = createAuthenticatedServerAction(
  async (session: Session): Promise<User> => {
    logger.log(`Looking up user with id '${session.user.id}'`);
    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
      },
      include: {
        emailChangeToken: {
          select: {
            newEmail: true,
          },
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
      throw new Error("User not found!");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      unconfirmedEmail: user.emailChangeToken[0]?.newEmail ?? null,
    };
  },
);
