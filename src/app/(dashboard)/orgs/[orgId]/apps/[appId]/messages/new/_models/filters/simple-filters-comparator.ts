import { MessageRuleComparator } from "@/models/message-rule-comparator";

export enum SimpleFiltersComparator {
  NEWER_THAN = "NEWER_THAN",
  AT_LEAST = "AT_LEAST",
  EXACTLY = "EXACTLY",
  UP_TO = "UP_TO",
  OLDER_THAN = "OLDER_THAN",
}

export function displayNameOfComparator(
  comparator: SimpleFiltersComparator,
): string {
  switch (comparator) {
    case SimpleFiltersComparator.NEWER_THAN:
      return "newer than (>)";
    case SimpleFiltersComparator.AT_LEAST:
      return "at least (>=)";
    case SimpleFiltersComparator.EXACTLY:
      return "exactly (=)";
    case SimpleFiltersComparator.UP_TO:
      return "up to (<=)";
    case SimpleFiltersComparator.OLDER_THAN:
      return "older than (<)";
  }
}

export function mapSimpleVersionFilterComparatorToRuleOperator(
  comparator: SimpleFiltersComparator | null | undefined,
) {
  let operator = MessageRuleComparator.EQUALS;
  switch (comparator) {
    case SimpleFiltersComparator.NEWER_THAN: {
      operator = MessageRuleComparator.IS_GREATER_THAN;
      break;
    }
    case SimpleFiltersComparator.AT_LEAST: {
      operator = MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL;
      break;
    }
    case SimpleFiltersComparator.EXACTLY: {
      operator = MessageRuleComparator.EQUALS;
      break;
    }
    case SimpleFiltersComparator.UP_TO: {
      operator = MessageRuleComparator.IS_LESS_THAN_OR_EQUAL;
      break;
    }
    case SimpleFiltersComparator.OLDER_THAN: {
      operator = MessageRuleComparator.IS_LESS_THAN;
      break;
    }
  }
  return operator;
}
