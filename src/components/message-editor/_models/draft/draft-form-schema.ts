import { MessageActionButtonDesign } from "@/models/message-action-button-design";
import { MessageActionLinkTarget } from "@/models/message-action-link-target";
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
    .oneOf(Object.values(MessageActionButtonDesign)),
  link: Yup.object({
    link: Yup.string()
      .url("The link must be a valid URL")
      .required("Link is required"),
    target: Yup.string()
      .oneOf(Object.values(MessageActionLinkTarget))
      .required("Target is required"),
  }).when("actionType", {
    is: MessageActionType.OPEN_LINK,
    then: (schema) => schema.required("Target is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
}).required();

export const draftFormSchema: Yup.ObjectSchema<DraftFormData> = Yup.object({
  title: Yup.string().required("You must provide a title"),
  body: Yup.string().required("You must provide a message"),
  isBlocking: Yup.boolean().required(),
  actions: Yup.array().of(actionSchema).required(),
}).required();
