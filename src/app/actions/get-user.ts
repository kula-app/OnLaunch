"use server";

import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import type { Session } from "next-auth";

const logger = new Logger("actions/get-user");

export const getUser = createAuthenticatedServerAction(
  async (session: Session) => {
    try {
      logger.log(`Looking up user with id '${session.user.id}'`);
      const user = await prisma.user.findFirst({
        where: {
          id: session.user.id,
        },
      });

      if (!user) {
        throw new Error("User not found!");
      }

      return {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch (error) {
      logger.error(`Internal server error: ${error}`);
      throw error;
    }
  },
);
