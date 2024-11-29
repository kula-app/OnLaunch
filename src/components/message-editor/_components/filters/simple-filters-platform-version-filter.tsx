"use client";

import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
  Switch,
  VStack,
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
  displayTextForAndroidVersion,
  SimpleFiltersAndroidVersion,
} from "../../_models/filters/simple-filters-android-version";
import {
  displayNameOfComparator,
  SimpleFiltersComparator,
} from "../../_models/filters/simple-filters-comparator";
import {
  displayTextForIosVersion,
  SimpleFiltersIosVersion,
} from "../../_models/filters/simple-filters-ios-version";
import { SimpleFiltersPlatform } from "../../_models/filters/simple-filters-platform";
import type {
  SimpleFilterFormData,
  SimplePlatformVersionFilterFormData,
} from "./simple-filters-form-data";

export const SimpleFiltersPlatformVersionFilter: React.FC<{}> = ({}) => {
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
      <Field name="simple.platformVersionFilter.isEnabled">
        {({ field, form }: FieldProps<boolean, FilterFormData>) => {
          const errors = (
            form.errors?.simple as
              | FormikErrors<SimpleFilterFormData>
              | undefined
          )?.platformVersionFilter as
            | FormikErrors<SimplePlatformVersionFilterFormData>
            | undefined;
          const touched = (
            form.touched?.simple as
              | FormikTouched<SimpleFilterFormData>
              | undefined
          )?.platformVersionFilter as
            | FormikTouched<SimplePlatformVersionFilterFormData>
            | undefined;
          const isFieldInvalid = !!errors && !!touched;

          return (
            <FormControl color={"white"} isInvalid={isFieldInvalid}>
              <Flex dir={"row"} align={"center"}>
                <FormLabel mb={0} htmlFor={field.name}>
                  {isTargetingMultiplePlatforms &&
                    "Do you want to target specific platform versions?"}
                  {isTargetingOnlyAndroid &&
                    "Do you want to target a specific Android version?"}
                  {isTargetingOnlyIos &&
                    "Do you want to target a specific iOS version?"}
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
      <Box
        pl={isTargetingMultiplePlatforms ? 8 : 0}
        mt={2}
        hidden={!values.simple?.platformVersionFilter?.isEnabled}
      >
        {isTargetingAndroid && (
          <FormControl color={"white"}>
            <FormLabel hidden={isTargetingOnlyAndroid}>
              Which version of Android is running on the user&apos;s device?
            </FormLabel>
            <Flex gap={2}>
              <Field name="simple.platformVersionFilter.android.comparator">
                {({ field }: FieldProps) => (
                  <VStack align={"start"} spacing={0}>
                    <Select {...field} variant={"brand-on-card"} w={"auto"}>
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
                  </VStack>
                )}
              </Field>
              <Field name="simple.platformVersionFilter.android.version">
                {({ field }: FieldProps) => (
                  <VStack align={"start"} spacing={0}>
                    <Select {...field} variant={"brand-on-card"} w={"auto"}>
                      {Object.values(SimpleFiltersAndroidVersion).map(
                        (version) => (
                          <option key={version} value={version}>
                            {displayTextForAndroidVersion(version)}
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
                  </VStack>
                )}
              </Field>
            </Flex>
          </FormControl>
        )}
        {isTargetingIos && (
          <FormControl color={"white"}>
            <FormLabel hidden={isTargetingOnlyIos}>
              Which version of iOS is running on the user&apos;s device?
            </FormLabel>
            <Flex gap={2}>
              <Field name="simple.platformVersionFilter.ios.comparator">
                {({ field }: FieldProps) => (
                  <VStack align={"start"} spacing={0}>
                    <Select {...field} variant={"brand-on-card"} w={"auto"}>
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
                  </VStack>
                )}
              </Field>
              <Field name="simple.platformVersionFilter.ios.version">
                {({ field }: FieldProps) => (
                  <VStack align={"start"} spacing={0}>
                    <Select {...field} variant={"brand-on-card"} w={"auto"}>
                      {Object.values(SimpleFiltersIosVersion).map((version) => (
                        <option key={version} value={version}>
                          {displayTextForIosVersion(version)}
                        </option>
                      ))}
                    </Select>
                    <ErrorMessage
                      name={field.name}
                      render={(errorMessage) => (
                        <FormErrorMessage>{errorMessage}</FormErrorMessage>
                      )}
                    />
                  </VStack>
                )}
              </Field>
            </Flex>
          </FormControl>
        )}
      </Box>
    </Box>
  );
};
