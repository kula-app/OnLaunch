"use server";

import { SessionNotFoundError } from "@/errors/session-not-found-error";
import type { App } from "@/models/app";
import prisma from "@/services/db";
import { authOptions } from "@/util/auth-options";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { getServerSession } from "next-auth";

const logger = new Logger(__filename);

export const getApp = createServerAction(
  async (appId: number): Promise<App | undefined> => {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new SessionNotFoundError();
    }

    // Fetch the app, then check if the user has access to the app
    logger.verbose(`Fetching app(id = ${appId})`);
    const app = await prisma.app.findFirst({
      where: {
        id: appId,
        organisation: {
          users: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });
    if (!app) {
      return undefined;
    }

    return {
      id: app.id,
      name: app.name,
    };
  },
);
