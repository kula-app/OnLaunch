import type { MessageRuleCondition } from "./message-rule-condition";
import type { MessageRuleGroupOperator } from "./message-rule-group-operator";

export interface MessageRuleGroup {
  id: number;
  operator: MessageRuleGroupOperator;
  rules: MessageRuleGroup[];
  conditions: MessageRuleCondition[];
}
