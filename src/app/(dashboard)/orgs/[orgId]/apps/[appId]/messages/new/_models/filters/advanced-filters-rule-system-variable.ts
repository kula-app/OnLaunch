import { MessageRuleComparator } from "@/models/message-rule-comparator";
import { MessageRuleSystemVariable } from "@/models/message-rule-system-variable";

export function displayTextForAdvancedFilterRulesSystemVariable(
  variable: MessageRuleSystemVariable,
) {
  switch (variable) {
    case MessageRuleSystemVariable.BUNDLE_ID:
      return "Bundle ID";
    case MessageRuleSystemVariable.BUNDLE_VERSION:
      return "Bundle Version";
    case MessageRuleSystemVariable.LOCALE:
      return "Locale";
    case MessageRuleSystemVariable.LOCALE_LANGUAGE_CODE:
      return "Language";
    case MessageRuleSystemVariable.LOCALE_REGION_CODE:
      return "Region";
    case MessageRuleSystemVariable.PACKAGE_NAME:
      return "Package Name";
    case MessageRuleSystemVariable.PLATFORM_NAME:
      return "Platform Name";
    case MessageRuleSystemVariable.PLATFORM_VERSION:
      return "Platform Version";
    case MessageRuleSystemVariable.RELEASE_VERSION:
      return "Release Version";
    case MessageRuleSystemVariable.VERSION_CODE:
      return "Version Code";
    case MessageRuleSystemVariable.VERSION_NAME:
      return "Version Name";
  }
}

export function getAvailableAdvancedFilterOperatorsForSystemVariable(
  variable: MessageRuleSystemVariable,
): Set<MessageRuleComparator> {
  const availableOperatorsPerSystemVariable: Record<
    MessageRuleSystemVariable,
    Set<MessageRuleComparator>
  > = {
    [MessageRuleSystemVariable.BUNDLE_ID]: new Set([
      MessageRuleComparator.EQUALS,
      MessageRuleComparator.IS_NOT_EQUAL,
      MessageRuleComparator.IS_GREATER_THAN,
      MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
      MessageRuleComparator.IS_LESS_THAN,
      MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
      MessageRuleComparator.CONTAINS,
      MessageRuleComparator.DOES_NOT_CONTAIN,
      MessageRuleComparator.IS_EMPTY,
      MessageRuleComparator.IS_NOT_EMPTY,
      MessageRuleComparator.IS_NULL,
      MessageRuleComparator.IS_NOT_NULL,
      MessageRuleComparator.MATCHES_REGEX,
      MessageRuleComparator.DOES_NOT_MATCH_REGEX,
    ]),
    [MessageRuleSystemVariable.BUNDLE_VERSION]: new Set([
      MessageRuleComparator.EQUALS,
      MessageRuleComparator.IS_NOT_EQUAL,
      MessageRuleComparator.IS_GREATER_THAN,
      MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
      MessageRuleComparator.IS_LESS_THAN,
      MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
      MessageRuleComparator.CONTAINS,
      MessageRuleComparator.DOES_NOT_CONTAIN,
      MessageRuleComparator.IS_EMPTY,
      MessageRuleComparator.IS_NOT_EMPTY,
      MessageRuleComparator.IS_NULL,
      MessageRuleComparator.IS_NOT_NULL,
      MessageRuleComparator.MATCHES_REGEX,
      MessageRuleComparator.DOES_NOT_MATCH_REGEX,
    ]),
    [MessageRuleSystemVariable.LOCALE]: new Set([
      MessageRuleComparator.EQUALS,
      MessageRuleComparator.IS_NOT_EQUAL,
      MessageRuleComparator.IS_GREATER_THAN,
      MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
      MessageRuleComparator.IS_LESS_THAN,
      MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
      MessageRuleComparator.CONTAINS,
      MessageRuleComparator.DOES_NOT_CONTAIN,
      MessageRuleComparator.IS_EMPTY,
      MessageRuleComparator.IS_NOT_EMPTY,
      MessageRuleComparator.IS_NULL,
      MessageRuleComparator.IS_NOT_NULL,
      MessageRuleComparator.MATCHES_REGEX,
      MessageRuleComparator.DOES_NOT_MATCH_REGEX,
    ]),
    [MessageRuleSystemVariable.LOCALE_LANGUAGE_CODE]: new Set([
      MessageRuleComparator.EQUALS,
      MessageRuleComparator.IS_NOT_EQUAL,
      MessageRuleComparator.IS_GREATER_THAN,
      MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
      MessageRuleComparator.IS_LESS_THAN,
      MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
      MessageRuleComparator.CONTAINS,
      MessageRuleComparator.DOES_NOT_CONTAIN,
      MessageRuleComparator.IS_EMPTY,
      MessageRuleComparator.IS_NOT_EMPTY,
      MessageRuleComparator.IS_NULL,
      MessageRuleComparator.IS_NOT_NULL,
      MessageRuleComparator.MATCHES_REGEX,
      MessageRuleComparator.DOES_NOT_MATCH_REGEX,
    ]),
    [MessageRuleSystemVariable.LOCALE_REGION_CODE]: new Set([
      MessageRuleComparator.EQUALS,
      MessageRuleComparator.IS_NOT_EQUAL,
      MessageRuleComparator.IS_GREATER_THAN,
      MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
      MessageRuleComparator.IS_LESS_THAN,
      MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
      MessageRuleComparator.CONTAINS,
      MessageRuleComparator.DOES_NOT_CONTAIN,
      MessageRuleComparator.IS_EMPTY,
      MessageRuleComparator.IS_NOT_EMPTY,
      MessageRuleComparator.IS_NULL,
      MessageRuleComparator.IS_NOT_NULL,
      MessageRuleComparator.MATCHES_REGEX,
      MessageRuleComparator.DOES_NOT_MATCH_REGEX,
    ]),
    [MessageRuleSystemVariable.PACKAGE_NAME]: new Set([
      MessageRuleComparator.EQUALS,
      MessageRuleComparator.IS_NOT_EQUAL,
      MessageRuleComparator.IS_GREATER_THAN,
      MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
      MessageRuleComparator.IS_LESS_THAN,
      MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
      MessageRuleComparator.CONTAINS,
      MessageRuleComparator.DOES_NOT_CONTAIN,
      MessageRuleComparator.IS_EMPTY,
      MessageRuleComparator.IS_NOT_EMPTY,
      MessageRuleComparator.IS_NULL,
      MessageRuleComparator.IS_NOT_NULL,
      MessageRuleComparator.MATCHES_REGEX,
      MessageRuleComparator.DOES_NOT_MATCH_REGEX,
    ]),
    [MessageRuleSystemVariable.PLATFORM_NAME]: new Set([
      MessageRuleComparator.EQUALS,
      MessageRuleComparator.IS_NOT_EQUAL,
      MessageRuleComparator.IS_GREATER_THAN,
      MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
      MessageRuleComparator.IS_LESS_THAN,
      MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
      MessageRuleComparator.CONTAINS,
      MessageRuleComparator.DOES_NOT_CONTAIN,
      MessageRuleComparator.IS_EMPTY,
      MessageRuleComparator.IS_NOT_EMPTY,
      MessageRuleComparator.IS_NULL,
      MessageRuleComparator.IS_NOT_NULL,
      MessageRuleComparator.MATCHES_REGEX,
      MessageRuleComparator.DOES_NOT_MATCH_REGEX,
    ]),
    [MessageRuleSystemVariable.PLATFORM_VERSION]: new Set([
      MessageRuleComparator.EQUALS,
      MessageRuleComparator.IS_NOT_EQUAL,
      MessageRuleComparator.IS_NOT_EQUAL,
      MessageRuleComparator.IS_GREATER_THAN,
      MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
      MessageRuleComparator.IS_LESS_THAN,
      MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
      MessageRuleComparator.CONTAINS,
      MessageRuleComparator.DOES_NOT_CONTAIN,
      MessageRuleComparator.IS_EMPTY,
      MessageRuleComparator.IS_NOT_EMPTY,
      MessageRuleComparator.IS_NULL,
      MessageRuleComparator.IS_NOT_NULL,
      MessageRuleComparator.MATCHES_REGEX,
      MessageRuleComparator.DOES_NOT_MATCH_REGEX,
    ]),
    [MessageRuleSystemVariable.RELEASE_VERSION]: new Set([
      MessageRuleComparator.EQUALS,
      MessageRuleComparator.IS_NOT_EQUAL,
      MessageRuleComparator.IS_GREATER_THAN,
      MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
      MessageRuleComparator.IS_LESS_THAN,
      MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
      MessageRuleComparator.CONTAINS,
      MessageRuleComparator.DOES_NOT_CONTAIN,
      MessageRuleComparator.IS_EMPTY,
      MessageRuleComparator.IS_NOT_EMPTY,
      MessageRuleComparator.IS_NULL,
      MessageRuleComparator.IS_NOT_NULL,
      MessageRuleComparator.MATCHES_REGEX,
      MessageRuleComparator.DOES_NOT_MATCH_REGEX,
    ]),
    [MessageRuleSystemVariable.VERSION_CODE]: new Set([
      MessageRuleComparator.EQUALS,
      MessageRuleComparator.IS_NOT_EQUAL,
      MessageRuleComparator.IS_GREATER_THAN,
      MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
      MessageRuleComparator.IS_LESS_THAN,
      MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
      MessageRuleComparator.CONTAINS,
      MessageRuleComparator.DOES_NOT_CONTAIN,
      MessageRuleComparator.IS_EMPTY,
      MessageRuleComparator.IS_NOT_EMPTY,
      MessageRuleComparator.IS_NULL,
      MessageRuleComparator.IS_NOT_NULL,
      MessageRuleComparator.MATCHES_REGEX,
      MessageRuleComparator.DOES_NOT_MATCH_REGEX,
    ]),
    [MessageRuleSystemVariable.VERSION_NAME]: new Set([
      MessageRuleComparator.EQUALS,
      MessageRuleComparator.IS_NOT_EQUAL,
      MessageRuleComparator.IS_GREATER_THAN,
      MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
      MessageRuleComparator.IS_LESS_THAN,
      MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
      MessageRuleComparator.CONTAINS,
      MessageRuleComparator.DOES_NOT_CONTAIN,
      MessageRuleComparator.IS_EMPTY,
      MessageRuleComparator.IS_NOT_EMPTY,
      MessageRuleComparator.IS_NULL,
      MessageRuleComparator.IS_NOT_NULL,
      MessageRuleComparator.MATCHES_REGEX,
      MessageRuleComparator.DOES_NOT_MATCH_REGEX,
    ]),
  };

  return availableOperatorsPerSystemVariable[variable] ?? new Set();
}
