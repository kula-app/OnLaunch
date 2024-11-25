import type { MessageRuleGroupOperator } from "@/models/message-rule-group-operator";
import type { AdvancedFiltersRuleCondition } from "./advanced-filters-rule-condition";

export interface AdvancedFiltersRuleGroup {
  id: string;
  operator: MessageRuleGroupOperator;
  groups?: AdvancedFiltersRuleGroup[] | null;
  conditions?: AdvancedFiltersRuleCondition[] | null;
}
