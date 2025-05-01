import type { MessageRuleComparator } from "@/models/message-rule-comparator";
import type { MessageRuleCondition } from "@/models/message-rule-condition";
import type { MessageRuleSystemVariable } from "@/models/message-rule-system-variable";

export interface AdvancedFiltersRuleCondition {
  id: MessageRuleCondition["id"];
  systemVariable: MessageRuleSystemVariable;
  comparator: MessageRuleComparator;
  userVariable: string;
}
