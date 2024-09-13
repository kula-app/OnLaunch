"use server";

import { NotFoundError } from "@/errors/not-found-error";
import { TokenExpiredError } from "@/errors/token-expired-error";
import { UserAlreadyJoinedOrgError } from "@/errors/user-already-joined-org-error";
import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger(__filename);

export const joinOrgWithDirectInvite = createServerAction(
  async (token: string): Promise<Pick<Org, "id">> => {
    logger.log(`Fetching organization with token '${token}'`);
    const userInvitationToken = await prisma.userInvitationToken.findFirst({
      where: {
        token: token as string,
      },
    });
    if (!userInvitationToken) {
      logger.error(`Provided user invitation token not found`);
      throw new NotFoundError("Invitation not found");
    }
    if (new Date() > userInvitationToken.expiryDate) {
      logger.error(`Provided user invitation token is expired`);
      throw new TokenExpiredError("Invitation is expired");
    }
    if (userInvitationToken.isArchived || userInvitationToken.isObsolete) {
      logger.error(`Provided user invitation token is obsolete`);
      throw new TokenExpiredError("Invite is obsolete");
    }

    logger.log(
      `Looking up organisation with id '${userInvitationToken.orgId}'`,
    );
    const org = await prisma.organisation.findFirst({
      where: {
        id: userInvitationToken.orgId,
        isDeleted: false,
      },
    });
    if (!org) {
      logger.error(
        `No organisation found with id '${userInvitationToken.orgId}'`,
      );
      throw new NotFoundError("Organisation not found");
    }

    logger.log(`Creating relation between user ${org.id} and org ${org.id}`);
    try {
      await prisma.usersInOrganisations.create({
        data: {
          userId: org.id,
          orgId: org.id,
          role: "USER",
        },
      });
    } catch (e: any) {
      if (e.code === "P2002") {
        logger.warn(`User ${org.id} already joined org ${org.id}`);
        throw new UserAlreadyJoinedOrgError(org.id);
      }
    }
    logger.log(`User ${org.id} joined org ${org.id}`);

    logger.log(`Updating user invitation token as obsolete`);
    await prisma.userInvitationToken.update({
      where: {
        token: userInvitationToken.token,
      },
      data: {
        isArchived: true,
      },
    });
    logger.log(`User invitation token updated as obsolete`);

    return {
      id: org.id,
    };
  },
);
