"use server";

import { BadRequestError } from "@/errors/bad-request-error";
import type { Message } from "@/models/message";
import type { MessageRuleCondition } from "@/models/message-rule-condition";
import type { MessageRuleGroup } from "@/models/message-rule-group";
import prisma from "@/services/db";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { PrismaDataUtils } from "@/util/prisma-data-utils";
import * as PrismaClient from "@prisma/client";
import type { ExcludeNestedIds } from "../../util/rule-evaluation/exclude-nested-ids";

const logger = new Logger(__filename);

export const createMessage = createServerAction(
  async (createMessageDto: ExcludeNestedIds<Message>) => {
    logger.log("Creating new message");

    // Use a transaction to ensure that all data is written or none
    const result = await prisma.$transaction(async () => {
      let actions: PrismaClient.Prisma.MessageActionCreateNestedManyWithoutMessageInput =
        {
          createMany: {
            data:
              createMessageDto.actions?.map((action) => {
                const actionType = PrismaDataUtils.mapActionTypeToPrisma(
                  action.actionType,
                );
                if (!actionType) {
                  throw new BadRequestError(
                    `Unknown action type: ${action.actionType}`,
                  );
                }
                const buttonDesign = PrismaDataUtils.mapButtonDesignToPrisma(
                  action.buttonDesign,
                );
                if (!buttonDesign) {
                  throw new BadRequestError(
                    `Unknown button design: ${action.buttonDesign}`,
                  );
                }

                return {
                  title: action.title,
                  actionType: actionType,
                  buttonDesign: buttonDesign,
                };
              }) ?? [],
          },
        };

      const data: PrismaClient.Prisma.MessageCreateInput = {
        title: createMessageDto.title,
        body: createMessageDto.body,
        actions: actions,

        startDate: createMessageDto.startDate,
        endDate: createMessageDto.endDate,

        blocking: createMessageDto.isBlocking,

        app: {
          connect: {
            id: createMessageDto.appId,
          },
        },
      };

      if (createMessageDto.ruleRootGroup) {
        // Prisma does not support nested/recursive writes yet, therefore we need to manually create the nested structure
        // Reference: https://github.com/prisma/prisma/issues/5455

        const messageFilterRuleGroupId = await createRuleGroup(
          createMessageDto.ruleRootGroup,
        );
        // Create a message root rule group with the previously created rule groups
        data.filter = {
          create: {
            ruleGroup: {
              connect: {
                id: messageFilterRuleGroupId,
              },
            },
          },
        };
      }

      // Create the message with the given data
      const result = await prisma.message.create({
        data: data,
      });
      return result;
    });
    logger.log(`Created message with id ${result.id}`);
  },
);

function createDataForRuleCondition(
  conditionDto: ExcludeNestedIds<MessageRuleCondition>,
): PrismaClient.Prisma.MessageRuleConditionCreateManyParentGroupInput {
  const comparator = PrismaDataUtils.mapConditionComparatorToPrisma(
    conditionDto.comparator,
  );
  if (!comparator) {
    throw new BadRequestError(`Unknown comparator: ${conditionDto.comparator}`);
  }
  const systemVariable = PrismaDataUtils.mapSystemVariableToPrisma(
    conditionDto.systemVariable,
  );
  if (!systemVariable) {
    throw new BadRequestError(
      `Unknown system variable: ${conditionDto.systemVariable}`,
    );
  }

  const data: PrismaClient.Prisma.MessageRuleConditionCreateManyParentGroupInput =
    {
      systemVariable: systemVariable,
      comparator: comparator,
      userVariable: conditionDto.userVariable,
    };

  return data;
}

function createDataForRuleConditions(
  conditionDtos: ExcludeNestedIds<MessageRuleCondition>[],
): PrismaClient.Prisma.MessageRuleConditionCreateManyParentGroupInput[] {
  return conditionDtos.map((condition) =>
    createDataForRuleCondition(condition),
  );
}

async function createRuleGroup(group: ExcludeNestedIds<MessageRuleGroup>) {
  // Create the rule groups recursively
  const createdRuleGroupIds = await createRuleGroups(group.groups);

  // The operator is manually mapped, as the input data is passed from a dto
  const operator = PrismaDataUtils.mapGroupOperatorToPrisma(group.operator);
  if (!operator) {
    throw new BadRequestError(`Unknown operator: ${group.operator}`);
  }

  const createdGroup = await prisma.messageRuleGroup.create({
    data: {
      operator: operator,
      conditions: {
        createMany: {
          data: createDataForRuleConditions(group.conditions),
        },
      },
      groups: {
        connect: createdRuleGroupIds.map((ruleGroupId) => ({
          id: ruleGroupId,
        })),
      },
    },
  });

  return createdGroup.id;
}

async function createRuleGroups(
  groupDtos: ExcludeNestedIds<MessageRuleGroup>[],
): Promise<PrismaClient.MessageRuleGroup["id"][]> {
  return await Promise.all(groupDtos.map((group) => createRuleGroup(group)));
}
