"use client";

import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Switch,
  Tag,
  TagCloseButton,
  TagLabel,
  Wrap,
} from "@chakra-ui/react";
import {
  ErrorMessage,
  Field,
  useFormikContext,
  type FieldProps,
  type FormikErrors,
  type FormikTouched,
} from "formik";
import React from "react";
import type { FilterFormData } from "../../_models/filters/filters-form-data";
import {
  displayTextForRegion,
  SimpleFiltersRegion,
} from "../../_models/filters/simple-filters-region";
import { AddTagButton } from "../add-tag-button";
import type {
  SimpleFilterFormData,
  SimpleRegionFilterFormData,
} from "./simple-filters-form-data";

export const SimpleFiltersRegionFilter: React.FC = () => {
  const { values } = useFormikContext<FilterFormData>();

  return (
    <Box w={"full"}>
      <Field name="simple.regionFilter.isEnabled">
        {({ field, form }: FieldProps<boolean, FilterFormData>) => {
          const errors = (
            (
              form.errors?.simple as
                | FormikErrors<SimpleFilterFormData>
                | undefined
            )?.regionFilter as
              | FormikErrors<SimpleRegionFilterFormData>
              | undefined
          )?.isEnabled;
          const touched = (
            (
              form.touched?.simple as
                | FormikTouched<SimpleFilterFormData>
                | undefined
            )?.regionFilter as
              | FormikTouched<SimpleRegionFilterFormData>
              | undefined
          )?.isEnabled;
          const isFieldInvalid = !!errors && !!touched;

          return (
            <FormControl color={"white"} isInvalid={isFieldInvalid}>
              <Flex dir={"row"} align={"center"}>
                <FormLabel mb={0} htmlFor={field.name}>
                  Do you want to target specific regions?
                </FormLabel>
                <Switch
                  {...field}
                  id={field.name}
                  value={field.value ? "true" : "false"}
                  isChecked={field.value}
                  colorScheme={"brand"}
                />
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
      <Box pl={8} mt={2} hidden={!values.simple?.regionFilter?.isEnabled}>
        <IncludedRegionFilter />
        <ExcludedRegionFilter />
      </Box>
    </Box>
  );
};

export const IncludedRegionFilter: React.FC = () => {
  return (
    <Field name="simple.regionFilter.included">
      {({
        field,
        form,
      }: FieldProps<SimpleFiltersRegion[] | undefined, FilterFormData>) => {
        const errors = (
          (
            form.errors?.simple as
              | FormikErrors<SimpleFilterFormData>
              | undefined
          )?.regionFilter as
            | FormikErrors<SimpleRegionFilterFormData>
            | undefined
        )?.included;
        const touched = (
          (
            form.touched?.simple as
              | FormikTouched<SimpleFilterFormData>
              | undefined
          )?.regionFilter as
            | FormikTouched<SimpleRegionFilterFormData>
            | undefined
        )?.included;
        const isFieldInvalid = !!errors && !!touched;

        const availableRegionsToAdd = Object.values(SimpleFiltersRegion)
          .filter((region) => !(field.value ?? []).includes(region))
          .map((region): { id: SimpleFiltersRegion; name: string } => ({
            id: region,
            name: displayTextForRegion(region),
          }));
        return (
          <FormControl color={"white"} isInvalid={isFieldInvalid}>
            <FormLabel>Which regions should be included?</FormLabel>
            <Wrap>
              {field.value?.map((region, idx) => (
                <Tag
                  size={"md"}
                  key={region}
                  variant="solid"
                  borderRadius="full"
                  colorScheme="green"
                >
                  <TagLabel>{region}</TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      const newRegions = (field.value ?? []).slice();
                      newRegions.splice(idx, 1);
                      form.setFieldValue(field.name, newRegions);
                    }}
                  />
                </Tag>
              ))}
              <AddTagButton
                values={availableRegionsToAdd}
                onClick={(id) => {
                  form.setFieldValue(
                    field.name,
                    (field.value ?? []).concat([id]),
                  );

                  // Remove the region from the excluded list if it was there
                  const formValues = form.values as FilterFormData;
                  const excluded = formValues.simple?.regionFilter?.excluded;
                  if (excluded?.includes(id)) {
                    form.setFieldValue(
                      "simple.regionFilter.excluded",
                      excluded.filter((region) => region !== id),
                    );
                  }
                }}
              />
            </Wrap>
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

export const ExcludedRegionFilter: React.FC = () => {
  return (
    <Field name="simple.regionFilter.excluded">
      {({
        field,
        form,
      }: FieldProps<SimpleFiltersRegion[] | undefined, FilterFormData>) => {
        const errors = (
          (
            form.errors?.simple as
              | FormikErrors<SimpleFilterFormData>
              | undefined
          )?.regionFilter as
            | FormikErrors<SimpleRegionFilterFormData>
            | undefined
        )?.excluded;
        const touched = (
          (
            form.touched?.simple as
              | FormikTouched<SimpleFilterFormData>
              | undefined
          )?.regionFilter as
            | FormikTouched<SimpleRegionFilterFormData>
            | undefined
        )?.excluded;
        const isFieldInvalid = !!errors && !!touched;

        const availableRegionsToAdd = Object.values(SimpleFiltersRegion)
          .filter((region) => !(field.value ?? []).includes(region))
          .map((region): { id: SimpleFiltersRegion; name: string } => ({
            id: region,
            name: displayTextForRegion(region),
          }));

        return (
          <FormControl color={"white"} mt={4} isInvalid={isFieldInvalid}>
            <FormLabel>Which regions should be excluded?</FormLabel>
            <Wrap>
              {(field.value ?? []).map((region, idx) => (
                <Tag
                  size={"md"}
                  key={region}
                  borderRadius="full"
                  variant="solid"
                  colorScheme="red"
                >
                  <TagLabel>{region}</TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      const newRegions = (field.value ?? []).slice();
                      newRegions.splice(idx, 1);
                      form.setFieldValue(field.name, newRegions);
                    }}
                  />
                </Tag>
              ))}
              <AddTagButton
                values={availableRegionsToAdd}
                onClick={(id) => {
                  form.setFieldValue(
                    field.name,
                    (field.value ?? []).concat([id]),
                  );

                  // Remove the region from the included list if it was there
                  const included = form.values.simple?.regionFilter?.included;
                  if (included?.includes(id)) {
                    form.setFieldValue(
                      "simple.regionFilter.included",
                      included?.filter((region) => region !== id),
                    );
                  }
                }}
              />
            </Wrap>
          </FormControl>
        );
      }}
    </Field>
  );
};
