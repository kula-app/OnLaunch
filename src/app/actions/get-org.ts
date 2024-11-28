"use server";

import { NotFoundError } from "@/errors/not-found-error";
import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger(__filename);

export const getOrg = createAuthenticatedServerAction(
  async (session, orgId: number): Promise<Org> => {
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
        org: {
          include: {
            subs: {
              where: {
                isDeleted: false,
              },
            },
          },
        },
      },
    });
    if (!org) {
      throw new NotFoundError(`Organization with id ${orgId} not found`);
    }

    return {
      id: org.org.id,
      name: org.org.name,
      subName: org.org.subs?.[0]?.subName,
      invitationToken: org.org.invitationToken,
    };
  },
);
