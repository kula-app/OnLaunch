"use client";

import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  Switch,
  Text,
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
  displayNameOfComparator,
  SimpleFiltersComparator,
} from "../../_models/filters/simple-filters-comparator";
import { SimpleFiltersPlatform } from "../../_models/filters/simple-filters-platform";
import {
  type SimpleAppVersionFilterFormData,
  type SimpleFilterFormData,
} from "./simple-filters-form-data";

export const SimpleFiltersAppVersionFilter: React.FC = () => {
  const { values } = useFormikContext<FilterFormData>();

  const isTargetingAndroid =
    values.simple?.platform == SimpleFiltersPlatform.ANDROID ||
    values.simple?.platform == SimpleFiltersPlatform.ALL;
  const isTargetingOnlyAndroid =
    values.simple?.platform == SimpleFiltersPlatform.ANDROID;
  const isTargetingIos =
    values.simple?.platform == SimpleFiltersPlatform.IOS ||
    values.simple?.platform == SimpleFiltersPlatform.ALL;
  const isTargetingOnlyIos =
    values.simple?.platform == SimpleFiltersPlatform.IOS;
  const isTargetingMultiplePlatforms =
    !isTargetingOnlyAndroid && !isTargetingOnlyIos;

  return (
    <Box w={"full"}>
      <Field name={["simple", "appVersionFilter", "isEnabled"].join(".")}>
        {({ field, form }: FieldProps<boolean, FilterFormData>) => {
          const errors = (
            (
              form.errors.simple as
                | FormikErrors<SimpleFilterFormData>
                | undefined
            )?.appVersionFilter as
              | FormikErrors<SimpleAppVersionFilterFormData>
              | undefined
          )?.isEnabled;
          const touched = (
            (
              form.touched.simple as
                | FormikTouched<SimpleFilterFormData>
                | undefined
            )?.appVersionFilter as
              | FormikTouched<SimpleAppVersionFilterFormData>
              | undefined
          )?.isEnabled;

          const isFieldInvalid = !!errors && !!touched;
          return (
            <FormControl isInvalid={isFieldInvalid} color={"white"}>
              <Flex dir={"row"} align={"center"}>
                <FormLabel mb={0} htmlFor={field.name}>
                  {isTargetingMultiplePlatforms
                    ? "Do you want to target specific app versions?"
                    : "Do you want to target a specific app version?"}
                </FormLabel>
                <Switch
                  {...field}
                  id={field.name}
                  value={field.value ? "true" : "false"}
                  isChecked={field.value}
                  colorScheme="brand"
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
      <Box
        pl={isTargetingMultiplePlatforms ? 8 : 0}
        mt={2}
        hidden={!values.simple?.appVersionFilter?.isEnabled}
      >
        {isTargetingAndroid && (
          <Box color={"white"} mt={2}>
            <Text hidden={isTargetingOnlyAndroid} mb={2}>
              Which app version is used on Android?
            </Text>
            <Flex dir={"row"} align={"top"} gap={2}>
              <Field name="filter.simple.appVersionFilter.android.comparator">
                {({
                  field,
                  form,
                }: FieldProps<SimpleFiltersComparator, FilterFormData>) => {
                  const errors = (
                    (
                      (
                        form.errors.simple as
                          | FormikErrors<SimpleFilterFormData>
                          | undefined
                      )
                        ?.appVersionFilter as FormikErrors<SimpleAppVersionFilterFormData>
                    )?.android as
                      | FormikErrors<SimpleAppVersionFilterFormData["android"]>
                      | undefined
                  )?.comparator;
                  const touched = (
                    (
                      (
                        form.touched.simple as
                          | FormikTouched<SimpleFilterFormData>
                          | undefined
                      )?.appVersionFilter as
                        | FormikTouched<SimpleAppVersionFilterFormData>
                        | undefined
                    )?.android as
                      | FormikTouched<SimpleAppVersionFilterFormData["android"]>
                      | undefined
                  )?.comparator;

                  const isFieldInvalid = !!errors && !!touched;
                  return (
                    <FormControl isInvalid={isFieldInvalid} w={"auto"}>
                      <Select {...field} variant={"brand-on-card"}>
                        {Object.values(SimpleFiltersComparator).map(
                          (comparator) => (
                            <option key={comparator} value={comparator}>
                              {displayNameOfComparator(comparator)}
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
              <Field name="filter.simple.appVersionFilter.android.version">
                {({ field, form }: FieldProps<string, FilterFormData>) => {
                  const errors = (
                    (
                      (
                        form.errors.simple as
                          | FormikErrors<SimpleFilterFormData>
                          | undefined
                      )
                        ?.appVersionFilter as FormikErrors<SimpleAppVersionFilterFormData>
                    )?.android as
                      | FormikErrors<SimpleAppVersionFilterFormData["android"]>
                      | undefined
                  )?.version;
                  const touched = (
                    (
                      (
                        form.touched.simple as
                          | FormikTouched<SimpleFilterFormData>
                          | undefined
                      )?.appVersionFilter as
                        | FormikTouched<SimpleAppVersionFilterFormData>
                        | undefined
                    )?.android as
                      | FormikTouched<SimpleAppVersionFilterFormData["android"]>
                      | undefined
                  )?.version;

                  const isFieldInvalid = !!errors && !!touched;
                  return (
                    <FormControl isInvalid={isFieldInvalid} w={"auto"}>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Enter a version..."
                        variant={"brand-on-card"}
                        w={"auto"}
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
            </Flex>
          </Box>
        )}
        {isTargetingIos && (
          <Box color={"white"} mt={2}>
            <Text hidden={isTargetingOnlyIos} mb={2}>
              Which app version is used on iOS?
            </Text>
            <Flex dir={"row"} align={"top"} gap={2}>
              <Field name="filter.simple.appVersionFilter.ios.comparator">
                {({
                  field,
                  form,
                }: FieldProps<SimpleFiltersComparator, FilterFormData>) => {
                  const errors = (
                    (
                      (
                        form.errors.simple as
                          | FormikErrors<SimpleFilterFormData>
                          | undefined
                      )
                        ?.appVersionFilter as FormikErrors<SimpleAppVersionFilterFormData>
                    )?.ios as
                      | FormikErrors<SimpleAppVersionFilterFormData["ios"]>
                      | undefined
                  )?.version;
                  const touched = (
                    (
                      (
                        form.touched.simple as
                          | FormikTouched<SimpleFilterFormData>
                          | undefined
                      )?.appVersionFilter as
                        | FormikTouched<SimpleAppVersionFilterFormData>
                        | undefined
                    )?.ios as
                      | FormikTouched<SimpleAppVersionFilterFormData["ios"]>
                      | undefined
                  )?.version;

                  const isFieldInvalid = !!errors && !!touched;
                  return (
                    <FormControl isInvalid={isFieldInvalid} w={"auto"}>
                      <Select {...field} variant={"brand-on-card"}>
                        {Object.values(SimpleFiltersComparator).map(
                          (comparator) => (
                            <option key={comparator} value={comparator}>
                              {displayNameOfComparator(comparator)}
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
              <Field name="simple.appVersionFilter.ios.version">
                {({ field, form }: FieldProps<string, FilterFormData>) => {
                  const errors = (
                    (
                      (
                        form.errors.simple as
                          | FormikErrors<SimpleFilterFormData>
                          | undefined
                      )
                        ?.appVersionFilter as FormikErrors<SimpleAppVersionFilterFormData>
                    )?.ios as
                      | FormikErrors<SimpleAppVersionFilterFormData["ios"]>
                      | undefined
                  )?.version;
                  const touched = (
                    (
                      (
                        form.touched.simple as
                          | FormikTouched<SimpleFilterFormData>
                          | undefined
                      )?.appVersionFilter as
                        | FormikTouched<SimpleAppVersionFilterFormData>
                        | undefined
                    )?.ios as
                      | FormikTouched<SimpleAppVersionFilterFormData["ios"]>
                      | undefined
                  )?.version;

                  const isFieldInvalid = !!errors && !!touched;
                  return (
                    <FormControl isInvalid={isFieldInvalid} w={"auto"}>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Enter a version..."
                        variant={"brand-on-card"}
                        w={"auto"}
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
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};
