import { MessageRuleGroupOperator } from "@/models/message-rule-group-operator";

export function displayLabelOfAdvancedFiltersRuleGroupOperator(
  operator: MessageRuleGroupOperator,
) {
  switch (operator) {
    case MessageRuleGroupOperator.AND:
      return "AND";
    case MessageRuleGroupOperator.OR:
      return "OR";
  }
}
