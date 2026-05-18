"use client";

import { Box, Heading, HStack, Input, Text, VStack, type BoxProps, Field as ChakraField } from "@chakra-ui/react";
import {
  ErrorMessage,
  Field,
  Formik,
  type FieldProps,
  type FormikProps,
} from "formik";
import moment from "moment";
import type { RefObject } from "react";
import type { TimeframeFormData } from "../_models/timeframe/timeframe-form-data";
import { timeframeSchema } from "../_models/timeframe/timeframe-form-schema";

export const FormStepTimeframe: React.FC<
  BoxProps & {
    formRef: RefObject<FormikProps<TimeframeFormData> | null>;
    initialValues: TimeframeFormData;
  }
> = ({ formRef, initialValues, ...boxProps }) => {
  return (
    <Formik
      innerRef={formRef}
      initialValues={initialValues}
      validationSchema={timeframeSchema}
      // Reinitialize the form if the initial values change, e.g. when prefilling the form with an existing message
      enableReinitialize={true}
      onSubmit={() => {}}
    >
      {() => {
        return (
          <Box {...boxProps}>
            <VStack align={"start"} gap={8} w={"xl"}>
              <VStack w={"full"} align={"start"}>
                <Heading size="lg" as="h1" color={"white"}>
                  Select Timeframe
                </Heading>
                <Text color={"white"}>
                  Select the timeframe for the message to be displayed.
                </Text>
                <HStack w={"full"} align={"start"}>
                  <Field name="startDate">
                    {({ field, form }: FieldProps<Date, TimeframeFormData>) => {
                      const isFieldInvalid =
                        !!form.errors?.startDate && !!form.touched?.startDate;

                      return (
                        <ChakraField.Root color="white" invalid={isFieldInvalid}>
                          <ChakraField.Label htmlFor={field.name}>Start Date</ChakraField.Label>
                          <Input
                            {...field}
                            value={moment(field.value).format(
                              "YYYY-MM-DDTHH:mm",
                            )}
                            onChange={(e) => {
                              form.setFieldValue(
                                field.name,
                                new Date(e.target.value),
                              );
                            }}
                            id={field.name}
                            type="datetime-local"
                            placeholder="Select start date and time"
                            variant={"brand-on-card"}
                            textColor={isFieldInvalid ? "red.400" : "white"}
                            css={{
                              colorScheme: "dark",
                              "::-webkit-calendar-picker-indicator":
                                isFieldInvalid
                                  ? {
                                      filter:
                                        "brightness(0) saturate(100%) invert(40%) sepia(71%) saturate(2533%) hue-rotate(331deg) brightness(88%) contrast(104%);",
                                    }
                                  : {},
                            }}
                          />
                          <ErrorMessage
                            name={field.name}
                            render={(errorMessage) => (
                              <ChakraField.ErrorText>
                                {errorMessage}
                              </ChakraField.ErrorText>
                            )}
                          />
                        </ChakraField.Root>
                      );
                    }}
                  </Field>
                  <Field name="endDate">
                    {({ field, form }: FieldProps<Date, TimeframeFormData>) => {
                      const isFieldInvalid =
                        !!form.errors?.endDate && !!form.touched?.endDate;

                      return (
                        <ChakraField.Root color="white" invalid={isFieldInvalid}>
                          <ChakraField.Label htmlFor={field.name}>End Date</ChakraField.Label>
                          <Input
                            {...field}
                            value={moment(field.value).format(
                              "YYYY-MM-DDTHH:mm",
                            )}
                            onChange={(e) => {
                              form.setFieldValue(
                                field.name,
                                new Date(e.target.value),
                              );
                            }}
                            id={field.name}
                            type="datetime-local"
                            placeholder="Select end date and time"
                            variant={"brand-on-card"}
                            textColor={isFieldInvalid ? "red.400" : "white"}
                            css={{
                              colorScheme: "dark",
                              "::-webkit-calendar-picker-indicator":
                                isFieldInvalid
                                  ? {
                                      filter:
                                        "brightness(0) saturate(100%) invert(40%) sepia(71%) saturate(2533%) hue-rotate(331deg) brightness(88%) contrast(104%);",
                                    }
                                  : {},
                            }}
                          />
                          <ErrorMessage
                            name={field.name}
                            render={(errorMessage) => (
                              <ChakraField.ErrorText>
                                {errorMessage}
                              </ChakraField.ErrorText>
                            )}
                          />
                        </ChakraField.Root>
                      );
                    }}
                  </Field>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        );
      }}
    </Formik>
  );
};
