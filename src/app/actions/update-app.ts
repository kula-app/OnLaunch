"use server";

import { NotFoundError } from "@/errors/not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { App } from "@/models/app";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger("actions/update-app");

export const updateApp = createAuthenticatedServerAction(
  async (
    session,
    appId: App["id"],
    data: {
      name: string;
    },
  ) => {
    logger.log(`Updating app(id = ${appId}) for user(id = ${session.user.id})`);

    const app = await prisma.app.findUnique({
      where: {
        id: appId,
        isDeleted: {
          not: true,
        },
      },
      include: {
        organisation: {
          where: {
            isDeleted: {
              not: true,
            },
          },
          include: {
            users: {
              where: {
                userId: session.user.id,
                user: {
                  isDeleted: {
                    not: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!app) {
      throw new NotFoundError(`App with id '${appId}' not found`);
    }
    if (!app.organisation?.users?.[0]) {
      throw new UnauthorizedError(`You are not allowed to access this app`);
    }
    if (app.organisation.users[0].role !== $Enums.Role.ADMIN) {
      throw new UnauthorizedError(`Only admins can update apps`);
    }

    logger.verbose(`Updating app(id = ${appId})`);
    await prisma.app.update({
      where: {
        id: appId,
      },
      data: {
        name: data.name,
      },
    });
    logger.verbose(`Updated app(id = ${appId})`);
  },
);
