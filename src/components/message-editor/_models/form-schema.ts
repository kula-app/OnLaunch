import * as Yup from "yup";
import { draftFormSchema } from "./draft/draft-form-schema";
import { filtersSchema } from "./filters/filters-form-schema";
import { type FormData } from "./form-data";
import { timeframeSchema } from "./timeframe/timeframe-form-schema";

export const formSchema: Yup.ObjectSchema<FormData> = Yup.object({
  draft: draftFormSchema.required(),
  timeframe: timeframeSchema.required(),
  filter: filtersSchema.required(),
});
