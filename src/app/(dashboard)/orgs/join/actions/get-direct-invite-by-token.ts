"use server";

import { NotFoundError } from "@/errors/not-found-error";
import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger(__filename);

export const getDirectInviteByToken = createServerAction(
  async (token: string): Promise<Pick<Org, "id" | "name">> => {
    logger.log(`Finding direct invitation with token '${token}'`);

    const userInvitationToken = await prisma.userInvitationToken.findFirst({
      where: {
        token,
      },
    });
    if (!userInvitationToken) {
      throw new NotFoundError("Invitation not found");
    }

    if (
      userInvitationToken.isArchived ||
      userInvitationToken.isObsolete ||
      userInvitationToken.expiryDate < new Date()
    ) {
      throw new NotFoundError("Invitation is obsolete");
    }

    logger.log(
      `Looking up organisation with id '${userInvitationToken.orgId}'`,
    );
    const organisation = await prisma.organisation.findFirst({
      where: {
        id: userInvitationToken.orgId,
        isDeleted: false,
      },
    });

    if (!organisation) {
      logger.error(
        `No organisation found with id '${userInvitationToken.orgId}'`,
      );
      throw new NotFoundError("Organisation not found");
    }

    return {
      id: organisation.id,
      name: organisation.name,
    };
  },
);
