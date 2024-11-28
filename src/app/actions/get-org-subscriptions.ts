"use server";

import { loadServerConfig } from "@/config/loadServerConfig";
import { ForbiddenError } from "@/errors/forbidden-error";
import { ServiceUnavailableError } from "@/errors/service-unavailable-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { Subscription } from "@/models/subscription";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger(`actions/get-org-subscriptions`);

export const getOrgSubscriptions = createAuthenticatedServerAction(
  async (session, { orgId }: { orgId: number }) => {
    logger.log(`Getting subscriptions for org ${orgId}`);

    const config = loadServerConfig();
    if (!config.stripeConfig.isEnabled) {
      throw new ServiceUnavailableError(`Stripe is not enabled`);
    }

    const authenticatedUserWithOrg =
      await prisma.usersInOrganisations.findUnique({
        where: {
          orgId_userId: {
            orgId,
            userId: session.user.id,
          },
          org: {
            isDeleted: {
              not: true,
            },
          },
          user: {
            isDeleted: {
              not: true,
            },
          },
        },
        select: {
          role: true,
          org: {
            select: {
              subs: {
                where: {
                  isDeleted: false,
                },
              },
            },
          },
        },
      });
    if (!authenticatedUserWithOrg) {
      throw new UnauthorizedError(
        `You do not have access to this organization`,
      );
    }
    if (authenticatedUserWithOrg.role !== $Enums.Role.ADMIN) {
      throw new ForbiddenError(
        `You do not have permission to access this resource`,
      );
    }

    return authenticatedUserWithOrg.org.subs.map((sub): Subscription => {
      return {
        id: sub.subId,
        name: sub.subName,
      };
    });
  },
);
