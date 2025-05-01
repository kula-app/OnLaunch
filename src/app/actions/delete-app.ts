"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { NotFoundError } from "@/errors/not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { App } from "@/models/app";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger("actions/delete-app");

export const deleteApp = createAuthenticatedServerAction(
  async (session, { appId }: { appId: App["id"] }) => {
    logger.log(`Deleting app with id '${appId}'`);

    logger.verbose(`Verify the user has permission to delete the app`);
    const app = await prisma.app.findUnique({
      where: {
        id: appId,
        isDeleted: {
          not: true,
        },
      },
      include: {
        organisation: {
          include: {
            users: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });
    if (!app) {
      throw new NotFoundError(`App with id '${appId}' not found`);
    }
    if (!app.organisation?.users[0]) {
      throw new UnauthorizedError(`You do not have access to this app`);
    }
    if (app.organisation.users[0].role !== $Enums.Role.ADMIN) {
      throw new ForbiddenError(`You do not have permission to delete this app`);
    }

    logger.verbose(`Soft-deleting the app with id '${appId}'`);
    await prisma.app.update({
      where: {
        id: appId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    logger.verbose(`App with id '${appId}' has been soft-deleted`);
  },
);
