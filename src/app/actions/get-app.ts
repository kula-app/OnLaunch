"use server";

import { NotFoundError } from "@/errors/not-found-error";
import type { App } from "@/models/app";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger(`actions/get-app`);

export const getApp = createAuthenticatedServerAction(
  async (session, appId: number): Promise<App> => {
    logger.verbose(
      `Fetching app(id = ${appId}) for user(id = ${session.user.id})`,
    );
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
      throw new NotFoundError(`App with id ${appId} not found`);
    }

    return {
      id: app.id,
      name: app.name,
      publicKey: app.publicKey,
    };
  },
);
