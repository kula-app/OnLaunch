"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { NotFoundError } from "@/errors/not-found-error";
import type { MessageAction } from "@/models/message-action";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger("actions:delete-message");

export const deleteMessage = createAuthenticatedServerAction(
  async (session, messageId: MessageAction["id"]) => {
    try {
      logger.log(`Deleting message(id = ${messageId})`);
      logger.verbose(
        `Verifying user has permission to delete message(id = ${messageId})`,
      );
      const message = await prisma.message.findUnique({
        where: {
          id: messageId,
        },
        select: {
          app: {
            select: {
              organisation: {
                select: {
                  users: {
                    where: {
                      userId: session.user.id,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!message) {
        throw new NotFoundError(`No message found with id ${messageId}`);
      }
      if (!message?.app?.organisation?.users?.[0]) {
        logger.warn(
          `User(id = ${session.user.id}) does not have permission to delete message(id = ${messageId})`,
        );
        throw new ForbiddenError(
          `Authenticated user does not have permission to delete message with id ${messageId}`,
        );
      }

      logger.verbose(`Deleting message(id = ${messageId})`);
      await prisma.message.delete({
        where: {
          id: messageId,
        },
      });
      logger.verbose(`Deleted message(id = ${messageId})`);
    } catch (e) {
      logger.error(`Internal server error occurred: ${e}`);
      throw e;
    }
  },
);
