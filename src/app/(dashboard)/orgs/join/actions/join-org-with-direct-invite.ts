"use server";

import { NotFoundError } from "@/errors/not-found-error";
import { TokenExpiredError } from "@/errors/token-expired-error";
import { TokenObsoleteError } from "@/errors/token-obsolete-error";
import { UserAlreadyJoinedOrgError } from "@/errors/user-already-joined-org-error";
import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger("actions/join-org-with-direct-invite");

export const joinOrgWithDirectInvite = createAuthenticatedServerAction(
  async (session, token: string): Promise<Pick<Org, "id">> => {
    logger.log(`Fetching organization with token '${token}'`);

    const userId = session.user.id;
    const userInvitationToken = await prisma.userInvitationToken.findFirst({
      where: {
        token: token,
      },
      include: {
        organisation: true,
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
      throw new TokenObsoleteError("Invite is obsolete");
    }

    logger.log(
      `Looking up organisation with id '${userInvitationToken.orgId}'`,
    );
    if (!userInvitationToken.organisation) {
      logger.error(
        `No organisation found with id '${userInvitationToken.orgId}'`,
      );
      throw new NotFoundError("Organisation not found");
    }

    logger.log(
      `Creating relation between user ${userId} and org ${userInvitationToken.orgId}`,
    );
    try {
      await prisma.usersInOrganisations.create({
        data: {
          userId: userId,
          orgId: userInvitationToken.orgId,
          role: userInvitationToken.role,
        },
      });
    } catch (e: any) {
      if (e.code === "P2002") {
        logger.warn(
          `User ${session.user.id} already joined org ${userInvitationToken.orgId}`,
        );
        throw new UserAlreadyJoinedOrgError(userInvitationToken.orgId);
      }
    }
    logger.log(`User ${userId} joined org ${userInvitationToken.orgId}`);

    logger.log(`Updating user invitation token as archived`);
    await prisma.userInvitationToken.update({
      where: {
        token: userInvitationToken.token,
      },
      data: {
        isArchived: true,
      },
    });
    logger.log(`User invitation token updated as archived`);

    return {
      id: userInvitationToken.orgId,
    };
  },
);
