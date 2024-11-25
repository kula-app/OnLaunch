export enum MessageRuleComparator {
  // Equality Operators
  EQUALS = "EQUALS",
  IS_NOT_EQUAL = "IS_NOT_EQUAL",

  // Comparison Operators
  IS_GREATER_THAN = "IS_GREATER_THAN",
  IS_GREATER_THAN_OR_EQUAL = "IS_GREATER_THAN_OR_EQUAL",
  IS_LESS_THAN = "IS_LESS_THAN",
  IS_LESS_THAN_OR_EQUAL = "IS_LESS_THAN_OR_EQUAL",

  // String Operators
  CONTAINS = "CONTAINS",
  DOES_NOT_CONTAIN = "DOES_NOT_CONTAIN",
  IS_EMPTY = "IS_EMPTY",
  IS_NOT_EMPTY = "IS_NOT_EMPTY",

  // Boolean Operators
  IS_NULL = "IS_NULL",
  IS_NOT_NULL = "IS_NOT_NULL",
  IS_TRUE = "IS_TRUE",
  IS_FALSE = "IS_FALSE",

  // Date Operators
  IS_AFTER = "IS_AFTER",
  IS_BEFORE = "IS_BEFORE",
  IS_AFTER_OR_EQUAL = "IS_AFTER_OR_EQUAL",
  IS_BEFORE_OR_EQUAL = "IS_BEFORE_OR_EQUAL",

  // Regex Operators
  MATCHES_REGEX = "MATCHES_REGEX",
  DOES_NOT_MATCH_REGEX = "DOES_NOT_MATCH_REGEX",
}