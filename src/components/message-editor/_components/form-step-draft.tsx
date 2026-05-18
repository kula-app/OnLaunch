"use client";

import { FormikChangeHandler } from "@/components/formik-change-handler";
import { ActionButtonDesign } from "@/models/action-button-design";
import { MessageActionType } from "@/models/message-action-type";
import {
  Alert,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Switch,
  Text,
  Textarea,
  VStack,
  type BoxProps,
  Field,
} from "@chakra-ui/react";
import {
  ErrorMessage,
  Field,
  FieldArray,
  Formik,
  type ArrayHelpers,
  type FieldProps,
  type FormikProps,
} from "formik";
import { type Ref } from "react";
import { FiPlusCircle } from "react-icons/fi";
import type { DraftFormData } from "../_models/draft/draft-form-data";
import { draftFormSchema } from "../_models/draft/draft-form-schema";
import { DraftMessageActionRow } from "./draft/draft-message-action-row";

type FormStepDraftProps = BoxProps & {
  /**
   * Initial values for the form fields.
   */
  initialValues: DraftFormData;
  /**
   * Reference to the Formik instance.
   *
   * Can be used to access the form values, errors, etc.
   */
  formRef: Ref<FormikProps<DraftFormData>>;
  /**
   * Change handler that will be called whenever the form values change
   *
   * The passed `formRef` is a reference to the Formik instance, but it can not notify
   */
  onValuesChange: (values: DraftFormData) => void;
};

export const FormStepDraft: React.FC<FormStepDraftProps> = ({
  formRef,
  initialValues,
  onValuesChange,
  ...props
}) => {
  return (
    <Formik
      innerRef={formRef}
      initialValues={initialValues}
      validationSchema={draftFormSchema}
      // Reinitialize the form if the initial values change, e.g. when prefilling the form with an existing message
      enableReinitialize={true}
      onSubmit={() => {}}
    >
      {() => (
        <>
          <FormikChangeHandler onChange={onValuesChange} />
          <Box {...props} w={"xl"}>
            <VStack align={"start"} w={"full"}>
              <Heading size="lg" as="h1" color={"white"}>
                New Message
              </Heading>
              <VStack
                gap={{ base: 4, md: "24px" }}
                align={"end"}
                w={"full"}
              >
                <Field name="title">
                  {({ field, form }: FieldProps<string, DraftFormData>) => {
                    const isFieldValid =
                      !!form.errors?.title && !!form.touched?.title;

                    return (
                      <Field.Root color="white" invalid={isFieldValid}>
                        <Field.Label htmlFor={field.name}>Title</Field.Label>
                        <Input
                          {...field}
                          id={field.name}
                          type={"text"}
                          placeholder="Title of the message..."
                          variant={"brand-on-card"}
                          minH={"50px"}
                        />
                        <ErrorMessage
                          name={field.name}
                          render={(errorMessage) => (
                            <Field.ErrorText>{errorMessage}</Field.ErrorText>
                          )}
                        />
                      </Field.Root>
                    );
                  }}
                </Field>
                <Field name="body">
                  {({ field, form }: FieldProps<string, DraftFormData>) => {
                    const isFieldInvalid =
                      !!form.errors?.body && !!form.touched?.body;

                    return (
                      <Field.Root color="white" invalid={isFieldInvalid}>
                        <Field.Label htmlFor={field.name}>Body</Field.Label>
                        <Textarea
                          {...field}
                          id={field.name}
                          placeholder="Enter the message..."
                          color={"white"}
                          bg={"rgb(19,21,54)"}
                          borderRadius="20px"
                          border="0.0625rem solid rgb(86, 87, 122)"
                          _invalid={{
                            borderColor: "red.500",
                          }}
                          rows={6}
                        />
                        <ErrorMessage
                          name={field.name}
                          render={(errorMessage) => (
                            <Field.ErrorText>{errorMessage}</Field.ErrorText>
                          )}
                        />
                      </Field.Root>
                    );
                  }}
                </Field>
                <Field name="isBlocking">
                  {({ field, form }: FieldProps<boolean, DraftFormData>) => {
                    return (
                      <Field.Root
                        display="flex"
                        alignItems="center"
                        color="white"
                      >
                        <VStack align={"start"} gap={0} w={"full"}>
                          <HStack>
                            <Switch
                              {...field}
                              value={field.value ? "true" : "false"}
                              isChecked={field.value}
                              id={field.name}
                              size={"md"}
                            />
                            <Field.Label htmlFor={field.name} mb={0} ml={2}>
                              Require user to use action?
                            </Field.Label>
                          </HStack>
                          <Field.HelperText color={"gray.200"}>
                            Blocking messages can only be dismissed using
                            actions.
                          </Field.HelperText>
                          {field.value && form.values.actions.length === 0 && (
                            <Alert.Root status="warning" variant={"solid"} mt={4}>
                              <Alert.Indicator />
                              <Box>
                                <Alert.Title>Attention!</Alert.Title>
                                <Alert.Description>
                                  You did not add any actions to this message
                                  yet! <br />
                                  Blocking messages without actions will not be
                                  dismissable and will block the user from using
                                  the app.
                                </Alert.Description>
                              </Box>
                            </Alert.Root>
                          )}
                        </VStack>
                      </Field.Root>
                    );
                  }}
                </Field>
                <VStack w={"full"} align={"start"}>
                  <Text as={FormLabel} color={"white"}>
                    Actions
                  </Text>
                  <VStack w={"full"} align={"start"} gap={4}>
                    <Field name="actions">
                      {({ field }: FieldProps<DraftFormData["actions"]>) => {
                        return (
                          <FieldArray
                            name={field.name}
                            render={(
                              arrayHelpers: ArrayHelpers<
                                DraftFormData["actions"]
                              >,
                            ) => {
                              return (
                                <>
                                  {field.value.map((action, actionIdx) => (
                                    <DraftMessageActionRow
                                      key={action.id}
                                      index={actionIdx}
                                      onDelete={() =>
                                        arrayHelpers.remove(actionIdx)
                                      }
                                    />
                                  ))}
                                  <Flex
                                    id={"add-button"}
                                    w={"full"}
                                    justify={"center"}
                                  >
                                    <Button
                                      colorPalette={"brand"}
                                      variant={"solid"}
                                      rounded={"full"}
                                      onClick={() => {
                                        const generatedId =
                                          Math.max(
                                            0,
                                            ...field.value.map(
                                              (action) => action.id,
                                            ),
                                          ) + 1;
                                        arrayHelpers.push({
                                          id: generatedId,
                                          actionType: MessageActionType.DISMISS,
                                          buttonDesign:
                                            ActionButtonDesign.FILLED,
                                          title: "",
                                        });
                                      }}><FiPlusCircle />Add Action
                                                                          </Button>
                                  </Flex>
                                </>
                              );
                            }}
                          />
                        );
                      }}
                    </Field>
                  </VStack>
                </VStack>
              </VStack>
            </VStack>
          </Box>
        </>
      )}
    </Formik>
  );
};
