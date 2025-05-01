"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { App } from "@/models/app";
import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { generateToken } from "@/util/auth";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger(__filename);

export const createApp = createAuthenticatedServerAction(
  async (
    session,
    { orgId, name }: { orgId: Org["id"]; name: string },
  ): Promise<App> => {
    logger.log(`Creating app '${name}' for org id '${orgId}'`);
    logger.verbose(`Verifying user has access to org with id '${orgId}'`);
    const org = await prisma.usersInOrganisations.findUnique({
      where: {
        orgId_userId: {
          orgId: orgId,
          userId: session.user.id,
        },
        org: {
          isDeleted: {
            not: true,
          },
        },
      },
    });
    if (!org) {
      throw new UnauthorizedError(
        `You do not have permission view this organisation`,
      );
    }
    if (org.role !== $Enums.Role.ADMIN) {
      throw new ForbiddenError(`You do not have permission to create an app`);
    }

    const app = await prisma.app.create({
      data: {
        name: name,
        organisation: {
          connect: {
            id: org.orgId,
          },
        },
        publicKey: generateToken(),
      },
    });
    logger.log(`Created app with id '${app.id}'`);

    return {
      id: app.id,
      name: app.name,
      publicKey: app.publicKey,
    };
  },
);
