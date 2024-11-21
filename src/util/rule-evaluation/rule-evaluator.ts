import { MessageRuleComparator } from "@/models/message-rule-comparator";
import type { MessageRuleCondition } from "@/models/message-rule-condition";
import type { MessageRuleGroup } from "@/models/message-rule-group";
import { MessageRuleGroupOperator } from "@/models/message-rule-group-operator";
import { MessageRuleSystemVariable } from "@/models/message-rule-system-variable";
import prisma from "@/services/db";
import * as PrismaClient from "@prisma/client";
import { PrismaDataUtils } from "../prisma-data-utils";
import type { RuleEvaluationContext } from "./rule-evaluation-context";

export class RuleEvaluator {
  static async isMessageIncluded(
    rootRuleGroupId: PrismaClient.MessageRuleGroup["id"],
    context: RuleEvaluationContext,
  ): Promise<boolean> {
    const tree = await this.findRuleGroupById(rootRuleGroupId);
    return this.evaluateGroup(tree, context);
  }

  static async findRuleGroupById(
    ruleGroupId: PrismaClient.MessageRuleGroup["id"],
  ): Promise<MessageRuleGroup> {
    const group = await prisma.messageRuleGroup.findUnique({
      where: {
        id: ruleGroupId,
      },
      include: {
        conditions: true,
        groups: true,
      },
    });
    if (!group) {
      throw new Error(`Failed to find group by id: ${ruleGroupId}`);
    }

    const operator = PrismaDataUtils.mapGroupOperatorFromPrisma(group.operator);
    if (!operator) {
      throw new Error(`Failed to map operator from prisma: ${group.operator}`);
    }

    return {
      id: group.id,
      operator: operator,
      conditions: group.conditions.map((condition): MessageRuleCondition => {
        const systemVariable = PrismaDataUtils.mapSystemVariableFromPrisma(
          condition.systemVariable,
        );
        if (!systemVariable) {
          throw new Error(
            `Failed to map system variable from prisma: ${condition.systemVariable}`,
          );
        }
        const comparator = PrismaDataUtils.mapConditionComparatorFromPrisma(
          condition.comparator,
        );
        if (!comparator) {
          throw new Error(
            `Failed to map comparator from prisma: ${condition.comparator}`,
          );
        }

        return {
          id: condition.id,
          systemVariable: systemVariable,
          comparator: comparator,
          userVariable: condition.userVariable ?? undefined,
        };
      }),
      groups: await Promise.all(
        group.groups.map((group) => this.findRuleGroupById(group.id)),
      ),
    };
  }

  static evaluateGroup(
    group: MessageRuleGroup,
    context: RuleEvaluationContext,
  ): boolean {
    switch (group.operator) {
      case MessageRuleGroupOperator.AND: {
        // If the group comparator is an AND, it can stop evaluating as soon as the first false sub-group or condition is found
        for (const subGroup of group.groups) {
          if (!this.evaluateGroup(subGroup, context)) {
            return false;
          }
        }
        for (const condition of group.conditions) {
          if (!this.evaluateCondition(condition, context)) {
            return false;
          }
        }
        return true;
      }
      case MessageRuleGroupOperator.OR:
        // If the group comparator is an OR, it can stop evaluating as soon as the first true sub-group or condition is found
        for (const subGroup of group.groups) {
          if (this.evaluateGroup(subGroup, context)) {
            return true;
          }
        }
        for (const condition of group.conditions) {
          if (this.evaluateCondition(condition, context)) {
            return true;
          }
        }
        return false;
    }
  }

  static evaluateCondition(
    condition: MessageRuleCondition,
    context: RuleEvaluationContext,
  ): boolean {
    let contextValue: string | null = null;
    switch (condition.systemVariable) {
      case MessageRuleSystemVariable.BUNDLE_ID:
        contextValue = context.clientBundleId ?? null;
        break;
      case MessageRuleSystemVariable.BUNDLE_VERSION:
        contextValue = context.clientBundleVersion ?? null;
        break;
      case MessageRuleSystemVariable.LOCALE:
        contextValue = context.clientLocale ?? null;
        break;
      case MessageRuleSystemVariable.LOCALE_LANGUAGE_CODE:
        contextValue = context.clientLocaleLanguageCode ?? null;
        break;
      case MessageRuleSystemVariable.LOCALE_REGION_CODE:
        contextValue = context.clientLocaleRegionCode ?? null;
        break;
      case MessageRuleSystemVariable.PACKAGE_NAME:
        contextValue = context.clientPackageName ?? null;
        break;
      case MessageRuleSystemVariable.PLATFORM_NAME:
        contextValue = context.clientPlatformName ?? null;
        break;
      case MessageRuleSystemVariable.PLATFORM_VERSION:
        contextValue = context.clientPlatformVersion ?? null;
        break;
      case MessageRuleSystemVariable.RELEASE_VERSION:
        contextValue = context.clientReleaseVersion ?? null;
        break;
      case MessageRuleSystemVariable.VERSION_CODE:
        contextValue = context.clientVersionCode ?? null;
        break;
      case MessageRuleSystemVariable.VERSION_NAME:
        contextValue = context.clientVersionName ?? null;
        break;
      default:
        throw new Error(`Invalid system variable: ${condition.systemVariable}`);
    }

    switch (condition.comparator) {
      // Equality Comparators
      case MessageRuleComparator.EQUALS:
        return contextValue === condition.userVariable;
      case MessageRuleComparator.IS_NOT_EQUAL:
        return contextValue !== condition.userVariable;

      // Comparison Comparators
      case MessageRuleComparator.IS_GREATER_THAN:
        return (
          contextValue !== null && contextValue > (condition.userVariable ?? "")
        );
      case MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL:
        return (
          contextValue !== null &&
          contextValue >= (condition.userVariable ?? "")
        );
      case MessageRuleComparator.IS_LESS_THAN:
        return (
          contextValue !== null && contextValue < (condition.userVariable ?? "")
        );
      case MessageRuleComparator.IS_LESS_THAN_OR_EQUAL:
        return (
          contextValue !== null &&
          contextValue <= (condition.userVariable ?? "")
        );

      // String Comparators
      case MessageRuleComparator.CONTAINS:
        return (
          contextValue !== null &&
          contextValue.includes(condition.userVariable ?? "")
        );
      case MessageRuleComparator.DOES_NOT_CONTAIN:
        return (
          contextValue !== null &&
          !contextValue.includes(condition.userVariable ?? "")
        );
      case MessageRuleComparator.IS_EMPTY:
        return contextValue === "";
      case MessageRuleComparator.IS_NOT_EMPTY:
        return contextValue !== "";

      // Boolean Comparators
      case MessageRuleComparator.IS_NULL:
        return contextValue === null;
      case MessageRuleComparator.IS_NOT_NULL:
        return contextValue !== null;
      case MessageRuleComparator.IS_TRUE:
        return contextValue === "true";
      case MessageRuleComparator.IS_FALSE:
        return contextValue === "false";

      // Date Comparators
      case MessageRuleComparator.IS_AFTER:
        return (
          contextValue !== null &&
          new Date(contextValue) > new Date(condition.userVariable ?? "")
        );
      case MessageRuleComparator.IS_BEFORE:
        return (
          contextValue !== null &&
          new Date(contextValue) < new Date(condition.userVariable ?? "")
        );
      case MessageRuleComparator.IS_AFTER_OR_EQUAL:
        return (
          contextValue !== null &&
          new Date(contextValue) >= new Date(condition.userVariable ?? "")
        );
      case MessageRuleComparator.IS_BEFORE_OR_EQUAL:
        return (
          contextValue !== null &&
          new Date(contextValue) <= new Date(condition.userVariable ?? "")
        );
      // Regex Comparators
      case MessageRuleComparator.MATCHES_REGEX: {
        const regex = new RegExp(condition.userVariable ?? "");
        return contextValue !== null && regex.test(contextValue);
      }
      case MessageRuleComparator.DOES_NOT_MATCH_REGEX: {
        const regex = new RegExp(condition.userVariable ?? "");
        return contextValue !== null && !regex.test(contextValue);
      }

      default:
        return false;
    }
  }
}
