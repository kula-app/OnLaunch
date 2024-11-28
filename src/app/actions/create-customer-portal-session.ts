"use server";

import { loadServerConfig } from "@/config/loadServerConfig";
import { ForbiddenError } from "@/errors/forbidden-error";
import { NotFoundError } from "@/errors/not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import Routes from "@/routes/routes";
import prisma from "@/services/db";
import { createStripeClient } from "@/services/stripe";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger(`actions/create-customer-portal-session`);

export const createCustomerPortalSession = createAuthenticatedServerAction(
  async (
    session,
    {
      orgId,
    }: {
      orgId: number;
    },
  ): Promise<{
    url: string;
  }> => {
    const stripe = createStripeClient();

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
        include: {
          org: {
            select: {
              stripeCustomerId: true,
            },
          },
        },
      });
    if (!authenticatedUserWithOrg) {
      throw new UnauthorizedError(`You can not access this organisation`);
    }
    if (authenticatedUserWithOrg.role !== $Enums.Role.ADMIN) {
      throw new ForbiddenError(
        `You do not have permission to access the customer portal`,
      );
    }

    if (!authenticatedUserWithOrg.org.stripeCustomerId) {
      logger.warn(
        `No stripe customer id found for organisation with id ${orgId}`,
      );
      throw new NotFoundError(`No stripe customer id found for organisation `);
    }

    logger.log("Creating customer portal session for organisation");
    const config = loadServerConfig();
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: authenticatedUserWithOrg.org.stripeCustomerId,
      return_url: `${config.nextAuth.url}${Routes.dashboard}`,
    });

    logger.log("Redirecting to Stripe customer portal");
    return {
      url: stripeSession.url,
    };
  },
);
