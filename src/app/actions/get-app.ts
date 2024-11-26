"use server";

import type { App } from "@/models/app";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger(__filename);

export const getApp = createAuthenticatedServerAction(
  async (session, appId: number): Promise<App | null> => {
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
      return null;
    }

    return {
      id: app.id,
      name: app.name,
    };
  },
);
