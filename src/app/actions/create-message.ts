"use server";

import { BadRequestError } from "@/errors/bad-request-error";
import { ActionButtonDesign } from "@/models/action-button-design";
import type { Message } from "@/models/message";
import { MessageActionType } from "@/models/message-action-type";
import { MessageRuleComparator } from "@/models/message-rule-comparator";
import type { MessageRuleCondition } from "@/models/message-rule-condition";
import type { MessageRuleGroup } from "@/models/message-rule-group";
import { MessageRuleGroupOperator } from "@/models/message-rule-group-operator";
import prisma from "@/services/db";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import * as PrismaClient from "@prisma/client";
import type { ExcludeNestedIds } from "../../util/rule-evaluation/exclude-nested-ids";

const logger = new Logger(__filename);

export const createMessage = createServerAction(
  async (createMessageDto: ExcludeNestedIds<Message>) => {
    logger.log("Creating new message");
    const result = await prisma.$transaction(async () => {
      let actions: PrismaClient.Prisma.MessageActionCreateNestedManyWithoutMessageInput =
        {
          createMany: {
            data:
              createMessageDto.actions?.map((action) => {
                let actionType: PrismaClient.ActionType;
                switch (action.actionType) {
                  case MessageActionType.DISMISS:
                    actionType = PrismaClient.ActionType.DISMISS;
                    break;
                  default:
                    throw new BadRequestError(
                      `Unknown action type: ${action.actionType}`,
                    );
                }

                let buttonDesign: PrismaClient.ButtonDesign;
                switch (action.buttonDesign) {
                  case ActionButtonDesign.FILLED:
                    buttonDesign = PrismaClient.ButtonDesign.FILLED;
                    break;
                  case ActionButtonDesign.OUTLINE:
                    buttonDesign = PrismaClient.ButtonDesign.TEXT;
                    break;
                  default:
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
  let comparator: PrismaClient.MessageRuleConditionComparator;
  switch (conditionDto.comparator) {
    // Equality Operators
    case MessageRuleComparator.EQUALS:
      comparator = PrismaClient.MessageRuleConditionComparator.EQUALS;
      break;
    case MessageRuleComparator.IS_NOT_EQUAL:
      comparator = PrismaClient.MessageRuleConditionComparator.IS_NOT_EQUAL;
      break;

    // Comparison Operators
    case MessageRuleComparator.IS_GREATER_THAN:
      comparator = PrismaClient.MessageRuleConditionComparator.IS_GREATER_THAN;
      break;
    case MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL:
      comparator =
        PrismaClient.MessageRuleConditionComparator.IS_GREATER_THAN_OR_EQUAL;
      break;
    case MessageRuleComparator.IS_LESS_THAN:
      comparator = PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN;
      break;
    case MessageRuleComparator.IS_LESS_THAN_OR_EQUAL:
      comparator =
        PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN_OR_EQUAL;
      break;

    // String Operators
    case MessageRuleComparator.CONTAINS:
      comparator = PrismaClient.MessageRuleConditionComparator.CONTAINS;
      break;
    case MessageRuleComparator.DOES_NOT_CONTAIN:
      comparator = PrismaClient.MessageRuleConditionComparator.DOES_NOT_CONTAIN;
      break;
    case MessageRuleComparator.IS_EMPTY:
      comparator = PrismaClient.MessageRuleConditionComparator.IS_EMPTY;
      break;
    case MessageRuleComparator.IS_NOT_EMPTY:
      comparator = PrismaClient.MessageRuleConditionComparator.IS_NOT_EMPTY;
      break;

    // Boolean Operators
    case MessageRuleComparator.IS_NULL:
      comparator = PrismaClient.MessageRuleConditionComparator.IS_NULL;
      break;
    case MessageRuleComparator.IS_NOT_NULL:
      comparator = PrismaClient.MessageRuleConditionComparator.IS_NOT_NULL;
      break;
    case MessageRuleComparator.IS_TRUE:
      comparator = PrismaClient.MessageRuleConditionComparator.IS_TRUE;
      break;
    case MessageRuleComparator.IS_FALSE:
      comparator = PrismaClient.MessageRuleConditionComparator.IS_FALSE;
      break;

    // Date Operators
    case MessageRuleComparator.IS_AFTER:
      comparator = PrismaClient.MessageRuleConditionComparator.IS_AFTER;
      break;
    case MessageRuleComparator.IS_BEFORE:
      comparator = PrismaClient.MessageRuleConditionComparator.IS_BEFORE;
      break;
    case MessageRuleComparator.IS_AFTER_OR_EQUAL:
      comparator =
        PrismaClient.MessageRuleConditionComparator.IS_AFTER_OR_EQUAL;
      break;
    case MessageRuleComparator.IS_BEFORE_OR_EQUAL:
      comparator =
        PrismaClient.MessageRuleConditionComparator.IS_BEFORE_OR_EQUAL;
      break;

    // Regex Operators
    case MessageRuleComparator.MATCHES_REGEX:
      comparator = PrismaClient.MessageRuleConditionComparator.MATCHES_REGEX;
      break;
    case MessageRuleComparator.DOES_NOT_MATCH_REGEX:
      comparator =
        PrismaClient.MessageRuleConditionComparator.DOES_NOT_MATCH_REGEX;
      break;

    default:
      throw new BadRequestError(
        `Unknown comparator: ${conditionDto.comparator}`,
      );
  }

  const data: PrismaClient.Prisma.MessageRuleConditionCreateManyParentGroupInput =
    {
      systemVariable: conditionDto.systemVariable,
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
  const createdRuleGroupIds = await createRuleGroups(group.rules);

  // The operator is manually mapped, as the input data is passed from a dto
  let operator: PrismaClient.MessageRuleGroupOperator;
  switch (group.operator) {
    case MessageRuleGroupOperator.AND:
      operator = PrismaClient.MessageRuleGroupOperator.AND;
      break;
    case MessageRuleGroupOperator.OR:
      operator = PrismaClient.MessageRuleGroupOperator.OR;
      break;
    default:
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
