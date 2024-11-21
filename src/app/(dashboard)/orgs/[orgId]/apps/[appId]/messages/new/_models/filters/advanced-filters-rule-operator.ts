import { MessageRuleComparator } from "@/models/message-rule-comparator";

export function displayTextForAdvancedFiltersRuleOperator(
  operator: MessageRuleComparator,
) {
  switch (operator) {
    case MessageRuleComparator.EQUALS:
      return "Equals";
    case MessageRuleComparator.IS_NOT_EQUAL:
      return "Is Not Equal";
    case MessageRuleComparator.IS_GREATER_THAN:
      return "Is Greater Than";
    case MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL:
      return "Is Greater Than Or Equal";
    case MessageRuleComparator.IS_LESS_THAN:
      return "Is Less Than";
    case MessageRuleComparator.IS_LESS_THAN_OR_EQUAL:
      return "Is Less Than Or Equal";
    case MessageRuleComparator.CONTAINS:
      return "Contains";
    case MessageRuleComparator.DOES_NOT_CONTAIN:
      return "Does Not Contain";
    case MessageRuleComparator.IS_EMPTY:
      return "Is Empty";
    case MessageRuleComparator.IS_NOT_EMPTY:
      return "Is Not Empty";
    case MessageRuleComparator.IS_NULL:
      return "Is Null";
    case MessageRuleComparator.IS_NOT_NULL:
      return "Is Not Null";
    case MessageRuleComparator.IS_TRUE:
      return "Is True";
    case MessageRuleComparator.IS_FALSE:
      return "Is False";
    case MessageRuleComparator.IS_AFTER:
      return "Is After";
    case MessageRuleComparator.IS_BEFORE:
      return "Is Before";
    case MessageRuleComparator.IS_AFTER_OR_EQUAL:
      return "Is After Or Equal";
    case MessageRuleComparator.IS_BEFORE_OR_EQUAL:
      return "Is Before Or Equal";
    case MessageRuleComparator.MATCHES_REGEX:
      return "Matches Regex";
    case MessageRuleComparator.DOES_NOT_MATCH_REGEX:
      return "Does Not Match Regex";
  }
}

export function isUnaryOperator(operator: MessageRuleComparator) {
  return new Set([
    MessageRuleComparator.IS_EMPTY,
    MessageRuleComparator.IS_NOT_EMPTY,
    MessageRuleComparator.IS_TRUE,
    MessageRuleComparator.IS_FALSE,
    MessageRuleComparator.IS_NULL,
    MessageRuleComparator.IS_NOT_NULL,
  ]).has(operator);
}

export function isDateOperator(operator: MessageRuleComparator) {
  return new Set([
    MessageRuleComparator.IS_AFTER,
    MessageRuleComparator.IS_BEFORE,
    MessageRuleComparator.IS_AFTER_OR_EQUAL,
    MessageRuleComparator.IS_BEFORE_OR_EQUAL,
  ]).has(operator);
}

export function isRegexOperator(operator: MessageRuleComparator) {
  return new Set([
    MessageRuleComparator.MATCHES_REGEX,
    MessageRuleComparator.DOES_NOT_MATCH_REGEX,
  ]).has(operator);
}
