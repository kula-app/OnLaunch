"use client";

import {
  displayNameForActionButtonDesign,
  displayNameForActionType,
  displayNameForMessageActionLinkTarget,
} from "@/components/display-mapper";
import { MessageActionButtonDesign } from "@/models/message-action-button-design";
import { MessageActionLinkTarget } from "@/models/message-action-link-target";
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
  useFormikContext,
  type FieldProps,
  type FormikErrors,
} from "formik";
import { FaArrowRight } from "react-icons/fa6";
import { FiTrash } from "react-icons/fi";
import type {
  DraftFormActionData,
  DraftFormData,
} from "../../_models/draft/draft-form-data";

export const DraftMessageActionRow: React.FC<{
  index: number;
  onDelete: () => void;
}> = ({ index, onDelete }) => {
  const { values } = useFormikContext<DraftFormData>();

  return (
    <Flex w={"full"} align={"top"} gap={2} flexDirection={"column"}>
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
          {({
            field,
            form,
          }: FieldProps<MessageActionButtonDesign, DraftFormData>) => {
            const draftActionErrors = form.errors?.actions as
              | FormikErrors<DraftFormActionData>[]
              | undefined;
            const isFieldInvalid =
              !!draftActionErrors?.[index]?.buttonDesign &&
              !!form.touched?.actions?.[index]?.buttonDesign;

            return (
              <FormControl color="white" isInvalid={isFieldInvalid} w={"auto"}>
                <Select {...field} id={field.name} variant={"brand-on-card"}>
                  {Object.values(MessageActionButtonDesign).map(
                    (buttonDesign) => (
                      <option key={buttonDesign} value={buttonDesign}>
                        {displayNameForActionButtonDesign(buttonDesign)}
                      </option>
                    ),
                  )}
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
          {({
            field,
            form,
          }: FieldProps<MessageActionButtonDesign, DraftFormData>) => {
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
      {values.actions[index].actionType === MessageActionType.OPEN_LINK && (
        <Flex w={"full"} align={"center"} gap={2} pl={4}>
          <FaArrowRight color="white" />
          <Field name={`actions[${index}].link.link`}>
            {({ field, form }: FieldProps<string, DraftFormData>) => {
              const draftActionErrors = form.errors?.actions as
                | FormikErrors<DraftFormActionData>[]
                | undefined;
              const isFieldInvalid =
                !!draftActionErrors?.[index]?.link?.link &&
                !!form.touched?.actions?.[index]?.link?.link;

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
                    placeholder="e.g. https://onlaunch.app"
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
          <Field name={`actions[${index}].link.target`}>
            {({
              field,
              form,
            }: FieldProps<MessageActionLinkTarget, DraftFormData>) => {
              const draftActionErrors = form.errors?.actions as
                | FormikErrors<DraftFormActionData>[]
                | undefined;
              const isFieldInvalid =
                !!draftActionErrors?.[index]?.link?.target &&
                !!form.touched?.actions?.[index]?.link?.target;
              return (
                <FormControl
                  color="white"
                  isInvalid={isFieldInvalid}
                  w={"auto"}
                >
                  <Select {...field} id={field.name} variant={"brand-on-card"}>
                    {Object.values(MessageActionLinkTarget).map(
                      (actionType) => (
                        <option key={actionType} value={actionType}>
                          {displayNameForMessageActionLinkTarget(actionType)}
                        </option>
                      ),
                    )}
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
        </Flex>
      )}
    </Flex>
  );
};
