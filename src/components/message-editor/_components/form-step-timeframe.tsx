"use client";

import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  type BoxProps,
} from "@chakra-ui/react";
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
    formRef: RefObject<FormikProps<TimeframeFormData>>;
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
            <VStack align={"start"} spacing={8} w={"xl"}>
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
                        <FormControl color="white" isInvalid={isFieldInvalid}>
                          <FormLabel htmlFor={field.name}>Start Date</FormLabel>
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
                              <FormErrorMessage>
                                {errorMessage}
                              </FormErrorMessage>
                            )}
                          />
                        </FormControl>
                      );
                    }}
                  </Field>
                  <Field name="endDate">
                    {({ field, form }: FieldProps<Date, TimeframeFormData>) => {
                      const isFieldInvalid =
                        !!form.errors?.endDate && !!form.touched?.endDate;

                      return (
                        <FormControl color="white" isInvalid={isFieldInvalid}>
                          <FormLabel htmlFor={field.name}>End Date</FormLabel>
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
                              <FormErrorMessage>
                                {errorMessage}
                              </FormErrorMessage>
                            )}
                          />
                        </FormControl>
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
