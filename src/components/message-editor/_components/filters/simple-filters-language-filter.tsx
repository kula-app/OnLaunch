"use client";

import { Box, Flex, Switch, Tag, Wrap, Field as ChakraField } from "@chakra-ui/react";
import {
  ErrorMessage,
  Field,
  useFormikContext,
  type FieldProps,
  type FormikErrors,
} from "formik";
import React from "react";
import type { FilterFormData } from "../../_models/filters/filters-form-data";
import {
  displayTextForSimpleFiltersLanguage,
  SimpleFiltersLanguage,
} from "../../_models/filters/simple-filters-language";
import { AddTagButton } from "../add-tag-button";
import type {
  SimpleFilterFormData,
  SimpleLanguageFilterFormData,
} from "./simple-filters-form-data";

export const SimpleLanguageFilter: React.FC = () => {
  const { values } = useFormikContext<FilterFormData>();

  return (
    <Box w={"full"}>
      <Field name="simple.languageFilter.isEnabled">
        {({ field, form }: FieldProps) => {
          const errors = (
            (
              form.errors?.simple as
                | FormikErrors<SimpleFilterFormData>
                | undefined
            )?.languageFilter as
              | FormikErrors<SimpleLanguageFilterFormData>
              | undefined
          )?.isEnabled;
          const touched = (
            (
              form.touched?.simple as
                | FormikErrors<SimpleFilterFormData>
                | undefined
            )?.languageFilter as
              | FormikErrors<SimpleLanguageFilterFormData>
              | undefined
          )?.isEnabled;
          const isFieldInvalid = !!errors && !!touched;

          return (
            <ChakraField.Root color={"white"} invalid={isFieldInvalid}>
              <Flex dir={"row"} align={"center"}>
                <ChakraField.Label mb={0} htmlFor={field.name}>
                  Do you want to target specific languages?
                </ChakraField.Label>
                <Switch
                  {...field}
                  id={field.name}
                  isChecked={field.value}
                  colorScheme={"brand"}
                />
              </Flex>
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
      <Box pl={8} mt={2} hidden={!values?.simple?.languageFilter?.isEnabled}>
        <IncludedLangageFilter />
        <ExcludedLangageFilter />
      </Box>
    </Box>
  );
};

const IncludedLangageFilter: React.FC = () => {
  return (
    <Field name="simple.languageFilter.included">
      {({
        field,
        form,
      }: FieldProps<SimpleFiltersLanguage[] | undefined, FilterFormData>) => {
        const errors = (
          (
            form.errors?.simple as
              | FormikErrors<SimpleFilterFormData>
              | undefined
          )?.languageFilter as
            | FormikErrors<SimpleLanguageFilterFormData>
            | undefined
        )?.included;
        const touched = (
          (
            form.touched?.simple as
              | FormikErrors<SimpleFilterFormData>
              | undefined
          )?.languageFilter as
            | FormikErrors<SimpleLanguageFilterFormData>
            | undefined
        )?.included;
        const isFieldInvalid = !!errors && !!touched;

        return (
          <ChakraField.Root color={"white"} invalid={isFieldInvalid}>
            <ChakraField.Label>Which languages should be included?</ChakraField.Label>
            <Wrap>
              {field.value?.map((language, idx) => (
                <Tag.Root
                  size={"md"}
                  key={language}
                  borderRadius="full"
                  variant="solid"
                  colorScheme="green"
                >
                  <Tag.Label>{language}</Tag.Label>
                  <Tag.CloseTrigger
                    onClick={() => {
                      const newLanguages = (field.value ?? [])?.slice();
                      newLanguages.splice(idx, 1);
                      form.setFieldValue(field.name, newLanguages);
                    }}
                  />
                </Tag.Root>
              ))}
              <AddTagButton
                values={Object.values(SimpleFiltersLanguage)
                  .filter((language) => !(field.value ?? []).includes(language))
                  .map((language) => ({
                    id: language,
                    name: displayTextForSimpleFiltersLanguage(language),
                  }))}
                onClick={(id) => {
                  form.setFieldValue(
                    field.name,
                    (field.value ?? []).concat([id]),
                  );

                  // Remove the language from the excluded list if it was there
                  const formValues = form.values as FilterFormData;
                  const excluded = formValues.simple?.languageFilter?.excluded;
                  if (excluded?.includes(id)) {
                    form.setFieldValue(
                      "simple.languageFilter.excluded",
                      excluded.filter((language) => language !== id),
                    );
                  }
                }}
              />
            </Wrap>
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
  );
};

const ExcludedLangageFilter: React.FC = () => {
  return (
    <Field name="simple.languageFilter.excluded">
      {({
        field,
        form,
      }: FieldProps<SimpleFiltersLanguage[] | undefined, FilterFormData>) => {
        const errors = (
          (
            form.errors?.simple as
              | FormikErrors<SimpleFilterFormData>
              | undefined
          )?.languageFilter as
            | FormikErrors<SimpleLanguageFilterFormData>
            | undefined
        )?.excluded;
        const touched = (
          (
            form.touched?.simple as
              | FormikErrors<SimpleFilterFormData>
              | undefined
          )?.languageFilter as
            | FormikErrors<SimpleLanguageFilterFormData>
            | undefined
        )?.excluded;
        const isFieldInvalid = !!errors && !!touched;

        return (
          <ChakraField.Root color={"white"} mt={4} invalid={!isFieldInvalid}>
            <ChakraField.Label>Which languages should be excluded?</ChakraField.Label>
            <Wrap>
              {field.value?.map((language, idx) => (
                <Tag.Root
                  size={"md"}
                  key={language}
                  borderRadius="full"
                  variant="solid"
                  colorScheme="red"
                >
                  <Tag.Label>{language}</Tag.Label>
                  <Tag.CloseTrigger
                    onClick={() => {
                      const newLanguages = (field.value ?? []).slice();
                      newLanguages.splice(idx, 1);
                      form.setFieldValue(field.name, newLanguages);
                    }}
                  />
                </Tag.Root>
              ))}
              <AddTagButton
                values={Object.values(SimpleFiltersLanguage)
                  .filter((language) => !(field.value ?? []).includes(language))
                  .map((language) => ({
                    id: language,
                    name: displayTextForSimpleFiltersLanguage(language),
                  }))}
                onClick={(id) => {
                  form.setFieldValue(
                    field.name,
                    (field.value ?? []).concat([id]),
                  );
                }}
              />
            </Wrap>
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
  );
};
