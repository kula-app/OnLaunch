"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { NotFoundError } from "@/errors/not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { Org } from "@/models/org";
import { OrgRole } from "@/models/org-role";
import type { OrgUserInvitation } from "@/models/org-user-invitation";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { Prisma } from "@prisma/client";

const logger = new Logger("actions/delete-org-user-invitation");

export const deleteOrgUserInvitation = createAuthenticatedServerAction(
  async (
    session,
    {
      orgId,
      invitationId,
    }: { orgId: Org["id"]; invitationId: OrgUserInvitation["id"] },
  ) => {
    logger.log(
      `Deleting organisation user invitation with id '${invitationId}' for org id '${orgId}'`,
    );
    logger.verbose(
      `Verifying user(id = ${session.user.id}) has access to org(id = ${orgId})`,
    );
    const org = await prisma.usersInOrganisations.findUnique({
      where: {
        orgId_userId: {
          orgId: orgId,
          userId: session.user.id,
        },
        user: {
          isDeleted: {
            not: true,
          },
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
    if (org.role !== OrgRole.ADMIN) {
      throw new ForbiddenError(
        `You do not have permission to delete user invitations for this organisation`,
      );
    }

    try {
      const invitation = await prisma.userInvitationToken.delete({
        where: {
          id: invitationId,
        },
      });
      logger.log(`Deleted user invitation with id '${invitationId}'`);

      return invitation;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code) {
        throw new NotFoundError(
          `User invitation with id '${invitationId}' not found`,
        );
      }
      throw error;
    }
  },
);
