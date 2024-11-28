"use server";

import { BadRequestError } from "@/errors/bad-request-error";
import { ForbiddenError } from "@/errors/forbidden-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import { MailType } from "@/models/mailType";
import type { Org } from "@/models/org";
import { OrgRole } from "@/models/org-role";
import prisma from "@/services/db";
import { generateToken, sendTokenPerMail } from "@/util/auth";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger(`actions/create-org-user-invite`);

export const createOrgUserInvite = createAuthenticatedServerAction(
  async (session, { orgId, email }: { orgId: Org["id"]; email: string }) => {
    logger.log(
      `Creating user invitation token for organisation with id '${orgId}'`,
    );
    logger.verbose(
      `Verifying user has access to organisation with id '${orgId}'`,
    );

    const authenticatedUserWithOrg =
      await prisma.usersInOrganisations.findUnique({
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
    if (!authenticatedUserWithOrg) {
      throw new UnauthorizedError(
        `You do not have permission to view this organisation`,
      );
    }
    if (authenticatedUserWithOrg.role !== OrgRole.ADMIN) {
      throw new ForbiddenError(
        `You do not have permission to invite users to this organisation`,
      );
    }

    logger.log(`Looking up user with email '${email}'`);
    const userByEmail = await prisma.user.findFirst({
      where: {
        email: email,
        isDeleted: {
          not: true,
        },
      },
    });

    // If the user is found, check if they are already in the organisation, so they can't be invited again
    if (userByEmail) {
      logger.log(
        `Looking up user with id '${userByEmail.id}' in organisation with id '${orgId}'`,
      );
      const searchUserAlreadyInOrganisation =
        await prisma.usersInOrganisations.findUnique({
          where: {
            orgId_userId: {
              userId: userByEmail.id,
              orgId: orgId,
            },
            org: {
              isDeleted: {
                not: true,
              },
            },
          },
        });
      if (searchUserAlreadyInOrganisation) {
        logger.warn("User already in organisation");
        throw new BadRequestError("User already in organisation!");
      }
    }

    logger.log("Updating previous user invitation tokens as obsolete");
    await prisma.userInvitationToken.updateMany({
      where: {
        invitedEmail: email,
        isObsolete: false,
      },
      data: {
        isObsolete: true,
      },
    });

    logger.log(
      `Creating user invitation token for email '${email}' for organisation with id '${orgId}'`,
    );
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
    const generatedToken = generateToken();
    const uit = await prisma.userInvitationToken.create({
      data: {
        invitedEmail: email,
        token: generatedToken,
        orgId: orgId,
        userId: authenticatedUserWithOrg.userId,
        expiryDate: expiryDate,
      },
    });

    sendTokenPerMail(
      uit.invitedEmail,
      userByEmail?.firstName ?? "",
      generatedToken,
      userByEmail ? MailType.DirectInvite : MailType.DirectInviteNewUser,
    );
  },
);
