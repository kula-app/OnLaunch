import type { SimpleFilterFormData } from "../../_components/filters/simple-filters-form-data";
import type { AdvancedFiltersRuleGroup } from "./advanced-filters-rule-group";
import type { FilterKind } from "./filter-kind";

export interface FilterFormData {
  isAll: boolean;
  kind: FilterKind;
  simple?: SimpleFilterFormData | null;
  advanced?: AdvancedFilterFormData | null;
}

export interface AdvancedFilterFormData {
  isDirty?: boolean | null;
  root?: AdvancedFiltersRuleGroup | null;
}
