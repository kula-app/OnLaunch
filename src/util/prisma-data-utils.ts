import { ActionButtonDesign } from "@/models/action-button-design";
import { MessageActionType } from "@/models/message-action-type";
import { MessageRuleComparator } from "@/models/message-rule-comparator";
import { MessageRuleGroupOperator } from "@/models/message-rule-group-operator";
import { MessageRuleSystemVariable } from "@/models/message-rule-system-variable";
import { OrgRole } from "@/models/org-role";
import * as PrismaClient from "@prisma/client";

export class PrismaDataUtils {
  static mapConditionComparatorToPrisma(
    comparator: MessageRuleComparator,
  ): PrismaClient.MessageRuleConditionComparator | undefined {
    switch (comparator) {
      // Equality Operators
      case MessageRuleComparator.EQUALS:
        return PrismaClient.MessageRuleConditionComparator.EQUALS;
      case MessageRuleComparator.IS_NOT_EQUAL:
        return PrismaClient.MessageRuleConditionComparator.IS_NOT_EQUAL;

      // Comparison Operators
      case MessageRuleComparator.IS_GREATER_THAN:
        return PrismaClient.MessageRuleConditionComparator.IS_GREATER_THAN;
      case MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL:
        return PrismaClient.MessageRuleConditionComparator
          .IS_GREATER_THAN_OR_EQUAL;
      case MessageRuleComparator.IS_LESS_THAN:
        return PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN;
      case MessageRuleComparator.IS_LESS_THAN_OR_EQUAL:
        return PrismaClient.MessageRuleConditionComparator
          .IS_LESS_THAN_OR_EQUAL;

      // String Operators
      case MessageRuleComparator.CONTAINS:
        return PrismaClient.MessageRuleConditionComparator.CONTAINS;
      case MessageRuleComparator.DOES_NOT_CONTAIN:
        return PrismaClient.MessageRuleConditionComparator.DOES_NOT_CONTAIN;
      case MessageRuleComparator.IS_EMPTY:
        return PrismaClient.MessageRuleConditionComparator.IS_EMPTY;
      case MessageRuleComparator.IS_NOT_EMPTY:
        return PrismaClient.MessageRuleConditionComparator.IS_NOT_EMPTY;

      // Boolean Operators
      case MessageRuleComparator.IS_NULL:
        return PrismaClient.MessageRuleConditionComparator.IS_NULL;
      case MessageRuleComparator.IS_NOT_NULL:
        return PrismaClient.MessageRuleConditionComparator.IS_NOT_NULL;
      case MessageRuleComparator.IS_TRUE:
        return PrismaClient.MessageRuleConditionComparator.IS_TRUE;
      case MessageRuleComparator.IS_FALSE:
        return PrismaClient.MessageRuleConditionComparator.IS_FALSE;

      // Date Operators
      case MessageRuleComparator.IS_AFTER:
        return PrismaClient.MessageRuleConditionComparator.IS_AFTER;
      case MessageRuleComparator.IS_BEFORE:
        return PrismaClient.MessageRuleConditionComparator.IS_BEFORE;
      case MessageRuleComparator.IS_AFTER_OR_EQUAL:
        return PrismaClient.MessageRuleConditionComparator.IS_AFTER_OR_EQUAL;
      case MessageRuleComparator.IS_BEFORE_OR_EQUAL:
        return PrismaClient.MessageRuleConditionComparator.IS_BEFORE_OR_EQUAL;

      // Regex Operators
      case MessageRuleComparator.MATCHES_REGEX:
        return PrismaClient.MessageRuleConditionComparator.MATCHES_REGEX;
      case MessageRuleComparator.DOES_NOT_MATCH_REGEX:
        return PrismaClient.MessageRuleConditionComparator.DOES_NOT_MATCH_REGEX;

      default:
        return undefined;
    }
  }

  static mapConditionComparatorFromPrisma(
    comparator: PrismaClient.MessageRuleConditionComparator,
  ): MessageRuleComparator | undefined {
    switch (comparator) {
      // Equality Operators
      case PrismaClient.MessageRuleConditionComparator.EQUALS:
        return MessageRuleComparator.EQUALS;
      case PrismaClient.MessageRuleConditionComparator.IS_NOT_EQUAL:
        return MessageRuleComparator.IS_NOT_EQUAL;

      // Comparison Operators
      case PrismaClient.MessageRuleConditionComparator.IS_GREATER_THAN:
        return MessageRuleComparator.IS_GREATER_THAN;
      case PrismaClient.MessageRuleConditionComparator.IS_GREATER_THAN_OR_EQUAL:
        return MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL;
      case PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN:
        return MessageRuleComparator.IS_LESS_THAN;
      case PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN_OR_EQUAL:
        return MessageRuleComparator.IS_LESS_THAN_OR_EQUAL;

      // String Operators
      case PrismaClient.MessageRuleConditionComparator.CONTAINS:
        return MessageRuleComparator.CONTAINS;
      case PrismaClient.MessageRuleConditionComparator.DOES_NOT_CONTAIN:
        return MessageRuleComparator.DOES_NOT_CONTAIN;
      case PrismaClient.MessageRuleConditionComparator.IS_EMPTY:
        return MessageRuleComparator.IS_EMPTY;
      case PrismaClient.MessageRuleConditionComparator.IS_NOT_EMPTY:
        return MessageRuleComparator.IS_NOT_EMPTY;

      // Boolean Operators
      case PrismaClient.MessageRuleConditionComparator.IS_NULL:
        return MessageRuleComparator.IS_NULL;
      case PrismaClient.MessageRuleConditionComparator.IS_NOT_NULL:
        return MessageRuleComparator.IS_NOT_NULL;
      case PrismaClient.MessageRuleConditionComparator.IS_TRUE:
        return MessageRuleComparator.IS_TRUE;
      case PrismaClient.MessageRuleConditionComparator.IS_FALSE:
        return MessageRuleComparator.IS_FALSE;

      // Date Operators
      case PrismaClient.MessageRuleConditionComparator.IS_AFTER:
        return MessageRuleComparator.IS_AFTER;
      case PrismaClient.MessageRuleConditionComparator.IS_BEFORE:
        return MessageRuleComparator.IS_BEFORE;
      case PrismaClient.MessageRuleConditionComparator.IS_AFTER_OR_EQUAL:
        return MessageRuleComparator.IS_AFTER_OR_EQUAL;
      case PrismaClient.MessageRuleConditionComparator.IS_BEFORE_OR_EQUAL:
        return MessageRuleComparator.IS_BEFORE_OR_EQUAL;

      // Regex Operators
      case PrismaClient.MessageRuleConditionComparator.MATCHES_REGEX:
        return MessageRuleComparator.MATCHES_REGEX;
      case PrismaClient.MessageRuleConditionComparator.DOES_NOT_MATCH_REGEX:
        return MessageRuleComparator.DOES_NOT_MATCH_REGEX;

      default:
        return undefined;
    }
  }

  static mapSystemVariableToPrisma(
    variable: MessageRuleSystemVariable,
  ): string {
    return variable;
  }

  static mapSystemVariableFromPrisma(
    variable: string,
  ): MessageRuleSystemVariable | undefined {
    return Object.values(MessageRuleSystemVariable).find(
      (predicate) => predicate === variable,
    );
  }

  static mapGroupOperatorFromPrisma(
    operator: PrismaClient.MessageRuleGroupOperator,
  ): MessageRuleGroupOperator | undefined {
    switch (operator) {
      case PrismaClient.MessageRuleGroupOperator.AND:
        return MessageRuleGroupOperator.AND;
      case PrismaClient.MessageRuleGroupOperator.OR:
        return MessageRuleGroupOperator.OR;
      default:
        return undefined;
    }
  }

  static mapGroupOperatorToPrisma(
    operator: MessageRuleGroupOperator,
  ): PrismaClient.MessageRuleGroupOperator | undefined {
    switch (operator) {
      case MessageRuleGroupOperator.AND:
        return PrismaClient.MessageRuleGroupOperator.AND;
      case MessageRuleGroupOperator.OR:
        return PrismaClient.MessageRuleGroupOperator.OR;
      default:
        return undefined;
    }
  }

  static mapButtonDesignFromPrisma(
    design: PrismaClient.ButtonDesign,
  ): ActionButtonDesign | undefined {
    switch (design) {
      case PrismaClient.ButtonDesign.FILLED:
        return ActionButtonDesign.FILLED;
      case PrismaClient.ButtonDesign.TEXT:
        return ActionButtonDesign.OUTLINE;
      default:
        return undefined;
    }
  }

  static mapButtonDesignToPrisma(
    design: ActionButtonDesign,
  ): PrismaClient.ButtonDesign | undefined {
    switch (design) {
      case ActionButtonDesign.FILLED:
        return PrismaClient.ButtonDesign.FILLED;
      case ActionButtonDesign.OUTLINE:
        return PrismaClient.ButtonDesign.TEXT;
      default:
        return undefined;
    }
  }

  static mapActionTypeFromPrisma(
    type: PrismaClient.ActionType,
  ): MessageActionType | undefined {
    switch (type) {
      case PrismaClient.ActionType.DISMISS:
        return MessageActionType.DISMISS;
      case PrismaClient.ActionType.OPEN_APP_IN_APP_STORE:
        return MessageActionType.OPEN_APP_IN_APP_STORE;
      default:
        return undefined;
    }
  }

  static mapActionTypeToPrisma(
    type: MessageActionType,
  ): PrismaClient.ActionType | undefined {
    switch (type) {
      case MessageActionType.DISMISS:
        return PrismaClient.ActionType.DISMISS;
      case MessageActionType.OPEN_APP_IN_APP_STORE:
        return PrismaClient.ActionType.OPEN_APP_IN_APP_STORE;
      default:
        return undefined;
    }
  }

  static mapUserRoleFromPrisma(role: PrismaClient.Role): OrgRole | undefined {
    switch (role) {
      case PrismaClient.Role.ADMIN:
        return OrgRole.ADMIN;
      case PrismaClient.Role.USER:
        return OrgRole.USER;
      default:
        return undefined;
    }
  }
}
