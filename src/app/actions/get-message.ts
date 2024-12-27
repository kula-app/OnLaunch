"use server";

import { NotFoundError } from "@/errors/not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { Message } from "@/models/message";
import type { MessageAction } from "@/models/message-action";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { PrismaDataUtils } from "@/util/prisma-data-utils";

const logger = new Logger("actions/get-message");

export const getMessage = createAuthenticatedServerAction(
  async (session, messageId: Message["id"]): Promise<Message> => {
    logger.log(`Looking up message with id '${messageId}'`);

    // Include the reference to the user in the organisation instead of adding it to the where clause
    // This allows to throw different errors depending on the existence or access level of the user
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
      include: {
        actions: true,
        app: {
          include: {
            organisation: {
              include: {
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
    if (!message?.app?.organisation?.users?.length) {
      throw new UnauthorizedError(
        `You are not authorized to view this message`,
      );
    }

    const mappedActions = message.actions.map((action): MessageAction => {
      const actionType = PrismaDataUtils.mapActionTypeFromPrisma(
        action.actionType,
      );
      if (!actionType) {
        throw new Error(`Unknown action type: ${action.actionType}`);
      }
      const buttonDesign = PrismaDataUtils.mapButtonDesignFromPrisma(
        action.buttonDesign,
      );
      if (!buttonDesign) {
        throw new Error(`Unknown button design: ${action.buttonDesign}`);
      }
      return {
        id: action.id,
        title: action.title,
        actionType: actionType,
        buttonDesign,
      };
    });
    return {
      id: message.id,
      appId: message.app.id,
      title: message.title,
      body: message.body,
      isBlocking: message.blocking,
      startDate: message.startDate,
      endDate: message.endDate,
      ruleRootGroup: undefined,
      actions: mappedActions,
    };
  },
);
