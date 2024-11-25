import { MessageRuleComparator } from "@/models/message-rule-comparator";
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
    return this.evaluateGroup(rootRuleGroupId, context);
  }

  private static async evaluateGroup(
    ruleGroupId: PrismaClient.MessageRuleGroup["id"],
    context: RuleEvaluationContext,
  ): Promise<boolean> {
    const group = await prisma.messageRuleGroup.findUnique({
      where: {
        id: ruleGroupId,
      },
      include: {
        conditions: true,
        groups: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!group) {
      throw new Error(`Failed to find group by id: ${ruleGroupId}`);
    }

    const operator = PrismaDataUtils.mapGroupOperatorFromPrisma(group.operator);
    if (!operator) {
      throw new Error(`Failed to map operator from prisma: ${group.operator}`);
    }

    switch (operator) {
      case MessageRuleGroupOperator.AND: {
        // Evaluate the conditions first, as they are included in the fetched data, and we can avoid extra queries
        // if they evaluate to false
        for (const condition of group.conditions) {
          if (!this.evaluateCondition(condition, context)) {
            return false;
          }
        }
        for (const subGroup of group.groups) {
          if (!(await this.evaluateGroup(subGroup.id, context))) {
            return false;
          }
        }
        return true;
      }
      case MessageRuleGroupOperator.OR: {
        // Evaluate the conditions first, as they are included in the fetched data, and we can avoid extra queries
        // if they evaluate to true
        for (const condition of group.conditions) {
          if (this.evaluateCondition(condition, context)) {
            return true;
          }
        }
        for (const subGroup of group.groups) {
          if (await this.evaluateGroup(subGroup.id, context)) {
            return true;
          }
        }
        return false;
      }
    }
  }

  static evaluateCondition(
    condition: PrismaClient.MessageRuleCondition,
    context: RuleEvaluationContext,
  ): boolean {
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

    let contextValue: string | null = null;
    switch (systemVariable) {
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
    }

    const userVariable = condition.userVariable ?? "";
    switch (comparator) {
      // Equality Comparators
      case MessageRuleComparator.EQUALS:
        return contextValue === userVariable;
      case MessageRuleComparator.IS_NOT_EQUAL:
        return contextValue !== userVariable;

      // Comparison Comparators
      case MessageRuleComparator.IS_GREATER_THAN:
        if (contextValue == null) {
          return false;
        }
        return contextValue > userVariable;
      case MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL:
        if (contextValue == null) {
          return false;
        }
        return contextValue >= userVariable;
      case MessageRuleComparator.IS_LESS_THAN:
        if (contextValue == null) {
          return false;
        }
        return contextValue < userVariable;
      case MessageRuleComparator.IS_LESS_THAN_OR_EQUAL:
        if (contextValue == null) {
          return false;
        }
        return contextValue <= userVariable;

      // String Comparators
      case MessageRuleComparator.CONTAINS:
        if (contextValue == null) {
          return false;
        }
        return contextValue.includes(userVariable);
      case MessageRuleComparator.DOES_NOT_CONTAIN:
        if (contextValue == null) {
          return false;
        }
        return !contextValue.includes(userVariable);
      case MessageRuleComparator.IS_EMPTY:
        if (contextValue == null) {
          return false;
        }
        return contextValue === "";
      case MessageRuleComparator.IS_NOT_EMPTY:
        if (contextValue == null) {
          return false;
        }
        return contextValue !== "";

      // Boolean Comparators
      case MessageRuleComparator.IS_NULL:
        return contextValue == null;
      case MessageRuleComparator.IS_NOT_NULL:
        return contextValue != null;
      case MessageRuleComparator.IS_TRUE:
        return contextValue === "true";
      case MessageRuleComparator.IS_FALSE:
        return contextValue === "false";

      // Date Comparators
      case MessageRuleComparator.IS_AFTER:
        if (contextValue == null) {
          return false;
        }
        return new Date(contextValue) > new Date(userVariable);
      case MessageRuleComparator.IS_BEFORE:
        if (contextValue == null) {
          return false;
        }
        return new Date(contextValue) < new Date(userVariable);
      case MessageRuleComparator.IS_AFTER_OR_EQUAL:
        if (contextValue == null) {
          return false;
        }
        return new Date(contextValue) >= new Date(userVariable);
      case MessageRuleComparator.IS_BEFORE_OR_EQUAL:
        if (contextValue == null) {
          return false;
        }
        return new Date(contextValue) <= new Date(userVariable);
      // Regex Comparators
      case MessageRuleComparator.MATCHES_REGEX: {
        if (contextValue == null) {
          return false;
        }
        try {
          const regex = new RegExp(userVariable);
          return regex.test(contextValue);
        } catch (e) {
          return false;
        }
      }
      case MessageRuleComparator.DOES_NOT_MATCH_REGEX: {
        if (contextValue == null) {
          return false;
        }
        try {
          const regex = new RegExp(userVariable);
          return !regex.test(contextValue);
        } catch (e) {
          return false;
        }
      }
    }
  }
}
