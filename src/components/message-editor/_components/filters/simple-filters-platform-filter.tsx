"use client";

import { Flex, Select, Field } from "@chakra-ui/react";
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
          <Field.Root color={"white"} invalid={isFieldInvalid}>
            <Flex flexDir={"row"} align={"center"}>
              <Field.Label my={0} htmlFor={field.name}>
                Which platform should see this message?
              </Field.Label>
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
                <Field.ErrorText>{errorMessage}</Field.ErrorText>
              )}
            />
          </Field.Root>
        );
      }}
    </Field>
  );
};
