"use client";

import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import {
  ErrorMessage,
  Field,
  type FieldProps,
  type FormikErrors,
  type FormikTouched,
} from "formik";
import React from "react";
import type { FilterFormData } from "../../_models/filters/filters-form-data";
import {
  displayTextForSimpleFiltersPlatform,
  SimpleFiltersPlatform,
} from "../../_models/filters/simple-filters-platform";
import type { SimpleFilterFormData } from "./simple-filters-form-data";

export const SimpleFiltersPlatformFilter: React.FC = () => {
  return (
    <Field name="simple.platform">
      {({ field, form }: FieldProps<SimpleFiltersPlatform, FilterFormData>) => {
        const errors = (
          form.errors?.simple as FormikErrors<SimpleFilterFormData> | undefined
        )?.platform;
        const touched = (
          form.touched?.simple as
            | FormikTouched<SimpleFilterFormData>
            | undefined
        )?.platform;
        const isFieldInvalid = !!errors && !!touched;

        return (
          <FormControl color={"white"} isInvalid={isFieldInvalid}>
            <Flex flexDir={"row"} align={"center"}>
              <FormLabel my={0} htmlFor={field.name}>
                Which platform should see this message?
              </FormLabel>
              <Select
                {...field}
                id={field.name}
                variant={"brand-on-card"}
                w={"auto"}
              >
                {Object.values(SimpleFiltersPlatform).map((platform) => (
                  <option key={platform} value={platform}>
                    {displayTextForSimpleFiltersPlatform(platform)}
                  </option>
                ))}
              </Select>
            </Flex>
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
  );
};
