"use server";

import { NotFoundError } from "@/errors/not-found-error";
import type { Message } from "@/models/message";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { type Session } from "next-auth";

const logger = new Logger(__filename);

export const getMessages = createAuthenticatedServerAction(
  async (
    session: Session,
    appId: number,
    filter: "active" | "planned" | "past",
  ): Promise<Message[] | undefined> => {
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
      return {
        id: message.id,
        appId: appId,
        title: message.title,
        body: message.body,
        isBlocking: message.blocking,
        startDate: message.startDate,
        endDate: message.endDate,
        ruleRootGroup: undefined,
      };
    });
  },
);
