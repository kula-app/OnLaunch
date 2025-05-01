import { ActionButtonDesign } from "@/models/action-button-design";
import { MessageActionType } from "@/models/message-action-type";
import * as Yup from "yup";
import type { DraftFormActionData, DraftFormData } from "./draft-form-data";

const actionSchema: Yup.ObjectSchema<DraftFormActionData> = Yup.object({
  id: Yup.number().required(),
  title: Yup.string().required("Title is required"),
  actionType: Yup.string()
    .required("Action type is required")
    .oneOf(Object.values(MessageActionType)),
  buttonDesign: Yup.string()
    .required("Button design is required")
    .oneOf(Object.values(ActionButtonDesign)),
}).required();

export const draftFormSchema: Yup.ObjectSchema<DraftFormData> = Yup.object({
  title: Yup.string().required("You must provide a title"),
  body: Yup.string().required("You must provide a message"),
  isBlocking: Yup.boolean().required(),
  actions: Yup.array().of(actionSchema).required(),
}).required();
