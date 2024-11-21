"use client";

import { ActionButtonDesign } from "@/models/action-button-design";
import { MessageActionType } from "@/models/message-action-type";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Switch,
  Text,
  Textarea,
  VStack,
  type BoxProps,
} from "@chakra-ui/react";
import {
  ErrorMessage,
  Field,
  FieldArray,
  Formik,
  type FieldProps,
  type FormikProps,
} from "formik";
import type { Ref } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";
import type { DraftFormData } from "../_models/draft/draft-form-data";
import { draftFormSchema } from "../_models/draft/draft-form-schema";
import { DraftMessageActionRow } from "./draft/draft-message-action-row";

export const FormStepDraft: React.FC<
  BoxProps & {
    initialValues: DraftFormData;
    formRef: Ref<FormikProps<DraftFormData>>;
  }
> = ({ formRef, initialValues, ...props }) => {
  return (
    <Formik
      innerRef={formRef}
      initialValues={initialValues}
      validationSchema={draftFormSchema}
      onSubmit={() => {}}
    >
      {() => (
        <Box {...props} w={"xl"}>
          <VStack align={"start"} w={"full"}>
            <Heading size="lg" as="h1" color={"white"}>
              New Message
            </Heading>
            <VStack spacing={{ base: 4, md: "24px" }} align={"end"} w={"full"}>
              <Field name="title">
                {({ field, form }: FieldProps<string, DraftFormData>) => {
                  const isFieldValid =
                    !!form.errors?.title && !!form.touched?.title;

                  return (
                    <FormControl color="white" isInvalid={isFieldValid}>
                      <FormLabel htmlFor={field.name}>Title</FormLabel>
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
                          <FormErrorMessage>{errorMessage}</FormErrorMessage>
                        )}
                      />
                    </FormControl>
                  );
                }}
              </Field>
              <Field name="body">
                {({ field, form }: FieldProps<string, DraftFormData>) => {
                  const isFieldInvalid =
                    !!form.errors?.body && !!form.touched?.body;

                  return (
                    <FormControl color="white" isInvalid={isFieldInvalid}>
                      <FormLabel htmlFor={field.name}>Body</FormLabel>
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
                          <FormErrorMessage>{errorMessage}</FormErrorMessage>
                        )}
                      />
                    </FormControl>
                  );
                }}
              </Field>
              <Field name="isBlocking">
                {({ field, form }: FieldProps<boolean, DraftFormData>) => {
                  return (
                    <FormControl
                      display="flex"
                      alignItems="center"
                      color="white"
                    >
                      <VStack align={"start"} spacing={0} w={"full"}>
                        <HStack>
                          <Switch
                            {...field}
                            value={field.value ? "true" : "false"}
                            isChecked={field.value}
                            id={field.name}
                            size={"md"}
                          />
                          <FormLabel htmlFor={field.name} mb={0} ml={2}>
                            Require user to use action?
                          </FormLabel>
                        </HStack>
                        <FormHelperText color={"gray.200"}>
                          Blocking messages can only be dismissed using actions.
                        </FormHelperText>
                        {field.value && form.values.actions.length === 0 && (
                          <Alert status="warning" variant={"solid"} mt={4}>
                            <AlertIcon />
                            <Box>
                              <AlertTitle>Attention!</AlertTitle>
                              <AlertDescription>
                                You did not add any actions to this message yet!{" "}
                                <br />
                                Blocking messages without actions will not be
                                dismissable and will block the user from using
                                the app.
                              </AlertDescription>
                            </Box>
                          </Alert>
                        )}
                      </VStack>
                    </FormControl>
                  );
                }}
              </Field>
              <VStack w={"full"} align={"start"}>
                <Text as={FormLabel} color={"white"}>
                  Actions
                </Text>
                <VStack w={"full"} align={"start"} spacing={4}>
                  <Field name="actions">
                    {({ field }: FieldProps<DraftFormData["actions"]>) => {
                      return (
                        <FieldArray
                          name={field.name}
                          render={(arrayHelpers) => {
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
                                    colorScheme={"brand"}
                                    variant={"solid"}
                                    rounded={"full"}
                                    leftIcon={<FiPlusCircle />}
                                    onClick={() => {
                                      arrayHelpers.push({
                                        id: uuidv4(),
                                        actionType: MessageActionType.DISMISS,
                                        buttonDesign: ActionButtonDesign.FILLED,
                                        title: "",
                                      });
                                    }}
                                  >
                                    Add Action
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
      )}
    </Formik>
  );
};
