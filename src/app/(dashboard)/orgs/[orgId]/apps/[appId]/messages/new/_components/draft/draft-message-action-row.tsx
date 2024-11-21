"use client";

import { ActionButtonDesign } from "@/models/action-button-design";
import { MessageActionType } from "@/models/message-action-type";
import {
  Flex,
  FormControl,
  FormErrorMessage,
  IconButton,
  Input,
  Select,
} from "@chakra-ui/react";
import {
  ErrorMessage,
  Field,
  type FieldProps,
  type FormikErrors,
} from "formik";
import { FiTrash } from "react-icons/fi";
import {
  displayNameForActionButtonDesign,
  displayNameForActionType,
} from "../../_models/display-mapper";
import type {
  DraftFormActionData,
  DraftFormData,
} from "../../_models/draft/draft-form-data";

export const DraftMessageActionRow: React.FC<{
  index: number;
  onDelete: () => void;
}> = ({ index, onDelete }) => {
  return (
    <Flex w={"full"} align={"start"} gap={2}>
      <Field name={`actions[${index}].title`}>
        {({ field, form }: FieldProps<string, DraftFormData>) => {
          const draftActionErrors = form.errors?.actions as
            | FormikErrors<DraftFormActionData>[]
            | undefined;
          const isFieldInvalid =
            !!draftActionErrors?.[index]?.title &&
            !!form.touched?.actions?.[index]?.title;

          return (
            <FormControl
              color="white"
              isInvalid={isFieldInvalid}
              w={"auto"}
              flexGrow={1}
            >
              <Input
                {...field}
                id={field.name}
                type={"text"}
                placeholder="Enter a title..."
                color={"white"}
                bg={"rgb(19,21,54)"}
                borderRadius="20px"
                border="0.0625rem solid rgb(86, 87, 122)"
              />
              <ErrorMessage
                name={field.name}
                render={(errorMessage) => (
                  <FormErrorMessage>{errorMessage}</FormErrorMessage>
                )}
              />
            </FormControl>
          );
        }}
      </Field>
      <Field name={`actions[${index}].buttonDesign`}>
        {({ field, form }: FieldProps<ActionButtonDesign, DraftFormData>) => {
          const draftActionErrors = form.errors?.actions as
            | FormikErrors<DraftFormActionData>[]
            | undefined;
          const isFieldInvalid =
            !!draftActionErrors?.[index]?.buttonDesign &&
            !!form.touched?.actions?.[index]?.buttonDesign;

          return (
            <FormControl color="white" isInvalid={isFieldInvalid} w={"auto"}>
              <Select {...field} id={field.name} variant={"brand-on-card"}>
                {Object.values(ActionButtonDesign).map((buttonDesign) => (
                  <option key={buttonDesign} value={buttonDesign}>
                    {displayNameForActionButtonDesign(buttonDesign)}
                  </option>
                ))}
              </Select>

              <ErrorMessage
                name={field.name}
                render={(errorMessage) => (
                  <FormErrorMessage>{errorMessage}</FormErrorMessage>
                )}
              />
            </FormControl>
          );
        }}
      </Field>
      <Field name={`actions[${index}].actionType`}>
        {({ field, form }: FieldProps<ActionButtonDesign, DraftFormData>) => {
          const draftActionErrors = form.errors?.actions as
            | FormikErrors<DraftFormActionData>[]
            | undefined;
          const isFieldInvalid =
            !!draftActionErrors?.[index]?.actionType &&
            !!form.touched?.actions?.[index]?.actionType;
          return (
            <FormControl color="white" isInvalid={isFieldInvalid} w={"auto"}>
              <Select {...field} id={field.name} variant={"brand-on-card"}>
                {Object.values(MessageActionType).map((actionType) => (
                  <option key={actionType} value={actionType}>
                    {displayNameForActionType(actionType)}
                  </option>
                ))}
              </Select>
              <ErrorMessage
                name={field.name}
                render={(errorMessage) => (
                  <FormErrorMessage>{errorMessage}</FormErrorMessage>
                )}
              />
            </FormControl>
          );
        }}
      </Field>
      <IconButton
        aria-label="Delete action"
        icon={<FiTrash />}
        colorScheme={"gray"}
        variant={"solid"}
        rounded={"full"}
        onClick={onDelete}
      />
    </Flex>
  );
};
