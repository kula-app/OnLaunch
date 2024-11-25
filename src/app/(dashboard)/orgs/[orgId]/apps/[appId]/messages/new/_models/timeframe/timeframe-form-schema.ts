import * as Yup from "yup";
import type { TimeframeFormData } from "./timeframe-form-data";

export const timeframeSchema: Yup.ObjectSchema<TimeframeFormData> = Yup.object({
  startDate: Yup.date().required("You must select a start date"),
  endDate: Yup.date()
    .required("You must select an end date")
    .min(Yup.ref("startDate"), "End date must be later than start date"),
}).required();
