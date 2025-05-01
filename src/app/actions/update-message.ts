"use server";

import { BadRequestError } from "@/errors/bad-request-error";
import { NotFoundError } from "@/errors/not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import { Message } from "@/models/message";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { PrismaDataUtils } from "@/util/prisma-data-utils";

const logger = new Logger(`actions/update-message`);

type ActionDto = Omit<Message, "appId">;

export const updateMessage = createAuthenticatedServerAction(
  async (session, dto: ActionDto) => {
    logger.log(`Updating message with id '${dto.id}'`);
    prisma.$transaction(async () => {
      logger.verbose(`Fetch message with id '${dto.id}'`);
      const message = await prisma.message.findUnique({
        where: {
          id: dto.id,
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
                      user: {
                        isDeleted: {
                          not: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!message) {
        throw new NotFoundError(`No message found with id '${dto.id}'`);
      }
      if (!message.app?.organisation?.users?.[0]) {
        throw new UnauthorizedError(`You are not authorized to update message`);
      }

      // -- Update the message --
      await prisma.message.update({
        where: {
          id: message.id,
        },
        data: {
          title: dto.title,
          body: dto.body,

          blocking: dto.isBlocking,

          startDate: dto.startDate,
          endDate: dto.endDate,
        },
      });

      // -- Update the actions --
      const existingActionIds =
        message.actions?.map((action) => action.id) ?? [];
      const newActionIds = dto.actions.map((action) => action.id);

      // Remove actions that are not in the new list
      const actionsToRemove = existingActionIds.filter(
        (id) => !newActionIds.includes(id),
      );
      await prisma.messageAction.deleteMany({
        where: {
          id: {
            in: actionsToRemove,
          },
        },
      });

      // Create or update actions
      for (const action of dto.actions) {
        const mappedActionType = PrismaDataUtils.mapActionTypeToPrisma(
          action.actionType,
        );
        if (!mappedActionType) {
          throw new BadRequestError(
            `Unknown action type: ${action.actionType}`,
          );
        }
        const mappedButtonDesign = PrismaDataUtils.mapButtonDesignToPrisma(
          action.buttonDesign,
        );
        if (!mappedButtonDesign) {
          throw new BadRequestError(
            `Unknown button design: ${action.buttonDesign}`,
          );
        }

        await prisma.messageAction.upsert({
          where: {
            id: action.id,
            messageId: message.id,
          },
          update: {
            title: action.title,
            actionType: mappedActionType,
            buttonDesign: mappedButtonDesign,
          },
          create: {
            id: action.id,
            messageId: message.id,

            title: action.title,
            actionType: mappedActionType,
            buttonDesign: mappedButtonDesign,
          },
        });
      }

      // Update the filter
      // TODO: implement this
    });
  },
);
