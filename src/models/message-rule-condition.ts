import type { MessageRuleComparator } from "./message-rule-comparator";
import type { MessageRuleSystemVariable } from "./message-rule-system-variable";

export interface MessageRuleCondition {
  id: number;
  systemVariable: MessageRuleSystemVariable;
  comparator: MessageRuleComparator;
  userVariable?: string;
}
