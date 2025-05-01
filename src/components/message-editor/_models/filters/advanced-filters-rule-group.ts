import type { MessageRuleGroup } from "@/models/message-rule-group";
import type { MessageRuleGroupOperator } from "@/models/message-rule-group-operator";
import type { AdvancedFiltersRuleCondition } from "./advanced-filters-rule-condition";

export interface AdvancedFiltersRuleGroup {
  id: MessageRuleGroup["id"];
  operator: MessageRuleGroupOperator;
  groups?: AdvancedFiltersRuleGroup[] | null;
  conditions?: AdvancedFiltersRuleCondition[] | null;
}
