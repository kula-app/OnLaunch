"use server";

import { SessionNotFoundError } from "@/errors/session-not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { App } from "@/models/app";
import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { authOptions } from "@/util/auth-options";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { getServerSession } from "next-auth";

const logger = new Logger(__filename);

export const getApps = createServerAction(
  async (orgId: Org["id"]): Promise<App[]> => {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new SessionNotFoundError();
    }

    logger.verbose(
      `Fetching apps of organization with id '${orgId}' for user with id '${session.user.id}'`,
    );
    const orgWithApps = await prisma.usersInOrganisations.findFirst({
      where: {
        userId: session.user.id,
        orgId: orgId,
      },
      include: {
        org: {
          include: {
            apps: {
              select: {
                id: true,
                name: true,
              },
              orderBy: {
                name: "asc",
              },
            },
          },
        },
      },
    });
    if (!orgWithApps) {
      throw new UnauthorizedError(
        "User does not have access to the organization",
      );
    }

    return (
      orgWithApps.org.apps?.map(
        (app): App => ({
          id: app.id,
          name: app.name,
        }),
      ) ?? []
    );
  },
);
