"use server";

import { NotFoundError } from "@/errors/not-found-error";
import type { Message } from "@/models/message";
import type { MessageAction } from "@/models/message-action";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { PrismaDataUtils } from "@/util/prisma-data-utils";
import { type Session } from "next-auth";

const logger = new Logger(__filename);

export const getMessages = createAuthenticatedServerAction(
  async (
    session: Session,
    appId: number,
    filter: "active" | "planned" | "past",
  ): Promise<Message[]> => {
    logger.verbose(`Fetching messages of app(id = ${appId})`);
    let whereFilter: {} | undefined;
    switch (filter) {
      case "active":
        whereFilter = {
          startDate: {
            lte: new Date(),
          },
          endDate: {
            gte: new Date(),
          },
        };
        break;
      case "planned":
        whereFilter = {
          startDate: {
            gt: new Date(),
          },
        };
        break;
      case "past":
        whereFilter = {
          endDate: {
            lt: new Date(),
          },
        };
        break;
    }

    const app = await prisma.app.findFirst({
      where: {
        id: appId,
        isDeleted: {
          not: true,
        },
      },
      include: {
        organisation: {
          select: {
            users: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
        messages: {
          where: whereFilter,
          include: {
            actions: true,
          },
        },
      },
    });
    if (!app) {
      throw new NotFoundError(`No app found with id ${appId}`);
    }
    if (!app.organisation?.users?.[0]) {
      logger.warn(
        `User(id = ${session.user.id}) does not have permission to access app(id = ${appId})`,
      );
      throw new NotFoundError(
        `Authenticated user does not have permission to access app with id ${appId}`,
      );
    }

    return app.messages.map((message): Message => {
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
        appId: appId,
        title: message.title,
        body: message.body,
        isBlocking: message.blocking,
        startDate: message.startDate,
        endDate: message.endDate,
        actions: mappedActions,
        ruleRootGroup: undefined,
      };
    });
  },
);
