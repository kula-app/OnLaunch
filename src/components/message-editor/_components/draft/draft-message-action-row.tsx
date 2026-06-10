"use client";

import {
  displayNameForActionButtonDesign,
  displayNameForActionType,
} from "@/components/display-mapper";
import { ActionButtonDesign } from "@/models/action-button-design";
import { MessageActionType } from "@/models/message-action-type";
import { BrandSelect } from "@/components/ui/brand-select";
import { Flex, IconButton, Input, Field as ChakraField } from "@chakra-ui/react";
import {
  ErrorMessage,
  Field,
  type FieldProps,
  type FormikErrors,
} from "formik";
import { FiTrash } from "react-icons/fi";
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
            <ChakraField.Root
              color="white"
              invalid={isFieldInvalid}
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
                  <ChakraField.ErrorText>{errorMessage}</ChakraField.ErrorText>
                )}
              />
            </ChakraField.Root>
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
            <ChakraField.Root color="white" invalid={isFieldInvalid} w={"auto"}>
              <BrandSelect {...field} id={field.name}>
                {Object.values(ActionButtonDesign).map((buttonDesign) => (
                  <option key={buttonDesign} value={buttonDesign}>
                    {displayNameForActionButtonDesign(buttonDesign)}
                  </option>
                ))}
              </BrandSelect>
              <ErrorMessage
                name={field.name}
                render={(errorMessage) => (
                  <ChakraField.ErrorText>{errorMessage}</ChakraField.ErrorText>
                )}
              />
            </ChakraField.Root>
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
            <ChakraField.Root color="white" invalid={isFieldInvalid} w={"auto"}>
              <BrandSelect {...field} id={field.name}>
                {Object.values(MessageActionType).map((actionType) => (
                  <option key={actionType} value={actionType}>
                    {displayNameForActionType(actionType)}
                  </option>
                ))}
              </BrandSelect>
              <ErrorMessage
                name={field.name}
                render={(errorMessage) => (
                  <ChakraField.ErrorText>{errorMessage}</ChakraField.ErrorText>
                )}
              />
            </ChakraField.Root>
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
