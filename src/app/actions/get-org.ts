"use server";

import { SessionNotFoundError } from "@/errors/session-not-found-error";
import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { authOptions } from "@/util/auth-options";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { getServerSession } from "next-auth";

const logger = new Logger(__filename);

export const getOrg = createServerAction(
  async (orgId: number): Promise<Org | undefined> => {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new SessionNotFoundError();
    }

    logger.verbose(
      `Fetching organization(id = ${orgId}) for user(id = ${session.user.id})`,
    );
    // Access the organization via the user mapping to ensure the user has access to the organization
    const org = await prisma.usersInOrganisations.findFirst({
      where: {
        user: {
          id: session.user.id,
          isDeleted: false,
        },
        org: {
          id: orgId,
          isDeleted: false,
        },
      },
      include: {
        org: true,
      },
    });
    if (!org) {
      return undefined;
    }

    return {
      id: org.org.id,
      name: org.org.name,
    };
  },
);
