import type { DraftFormData } from "./draft/draft-form-data";
import type { FilterFormData } from "./filters/filters-form-data";
import type { TimeframeFormData } from "./timeframe/timeframe-form-data";

export interface FormData {
  draft: DraftFormData;
  timeframe: TimeframeFormData;
  filter: FilterFormData;
}
