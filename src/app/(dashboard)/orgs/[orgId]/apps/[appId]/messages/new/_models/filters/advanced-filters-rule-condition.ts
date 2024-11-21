import type { MessageRuleComparator } from "@/models/message-rule-comparator";
import type { MessageRuleSystemVariable } from "@/models/message-rule-system-variable";

export interface AdvancedFiltersRuleCondition {
  id: string;
  systemVariable: MessageRuleSystemVariable;
  comparator: MessageRuleComparator;
  userVariable: string;
}
