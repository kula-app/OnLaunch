"use client";

import { MessageRuleComparator } from "@/models/message-rule-comparator";
import { MessageRuleGroupOperator } from "@/models/message-rule-group-operator";
import { MessageRuleSystemVariable } from "@/models/message-rule-system-variable";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useDisclosure,
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
import { useEffect, type RefObject } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";
import type { AdvancedFiltersRuleGroup } from "../_models/filters/advanced-filters-rule-group";
import {
  displayTextForFilterKind,
  FilterKind,
} from "../_models/filters/filter-kind";
import { type FilterFormData } from "../_models/filters/filters-form-data";
import { filtersSchema } from "../_models/filters/filters-form-schema";
import { mapSimpleVersionFilterComparatorToRuleOperator } from "../_models/filters/simple-filters-comparator";
import { SimpleFiltersLanguage } from "../_models/filters/simple-filters-language";
import { SimpleFiltersPlatform } from "../_models/filters/simple-filters-platform";
import { SimpleFiltersRegion } from "../_models/filters/simple-filters-region";
import { AdvancedFiltersEditor } from "./filters/advanced-filters-editor";
import { SimpleFiltersEditor } from "./filters/simple-filters-editor";

export const FormStepFilters: React.FC<
  BoxProps & {
    formRef: RefObject<FormikProps<FilterFormData>>;
    initialValues: FilterFormData;
  }
> = ({ formRef, initialValues, ...boxProps }) => {
  const {
    isOpen: isOpenDiscardModal,
    onOpen: onOpenDiscardModal,
    onClose: onCloseDiscardModal,
  } = useDisclosure();

  return (
    <Formik
      innerRef={formRef}
      initialValues={initialValues}
      validationSchema={filtersSchema}
      onSubmit={() => {}}
    >
      {(props) => {
        const isConfiguringAdvancedFilters =
          props.values.isAll === false &&
          props.values.kind === FilterKind.ADVANCED;

        return (
          <Box
            {...boxProps}
            minW={"xl"}
            maxW={isConfiguringAdvancedFilters ? "4xl" : "xl"}
          >
            <FilterFormSyncSimpleToAdvancedRules {...props} />
            <VStack align={"start"} w={"full"}>
              <Heading size="lg" as="h1" color={"white"}>
                Configure Filters
              </Heading>
              <Field name="isAll">
                {({ field, form }: FieldProps<boolean, FilterFormData>) => {
                  const isFieldInvalid =
                    !!form.errors?.isAll && !!form.touched?.isAll;
                  return (
                    <FormControl color={"white"} isInvalid={isFieldInvalid}>
                      <Flex flexDir={"row"} align={"center"}>
                        <FormLabel my={0} htmlFor={field.name}>
                          Do you want to show this message to all users?
                        </FormLabel>
                        <Select
                          {...field}
                          value={field.value ? "true" : "false"}
                          onChange={(e) =>
                            form.setFieldValue(
                              field.name,
                              e.target.value === "true",
                            )
                          }
                          id="filter.isAll"
                          variant={"brand-on-card"}
                          w={"auto"}
                        >
                          <option value={"true"}>Yes</option>
                          <option value={"false"}>No</option>
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
              {!props.values.isAll && (
                <>
                  <Flex flexDir={"column"} align={"center"} w={"full"}>
                    <Field name={"kind"}>
                      {({
                        field,
                        form,
                      }: FieldProps<FilterKind, FilterFormData>) => (
                        <ButtonGroup
                          isAttached
                          variant="solid"
                          color={"white"}
                          my={4}
                        >
                          {Object.values(FilterKind).map((kind, idx, all) => (
                            <Button
                              key={kind}
                              flex={1}
                              onClick={() => {
                                // If the user has made changes to the advanced filters, prompt them to discard changes
                                // when switching to simple filters, to make sure they don't lose their work
                                if (
                                  kind === FilterKind.SIMPLE &&
                                  form.values.advanced?.isDirty
                                ) {
                                  onOpenDiscardModal();
                                } else {
                                  form.setFieldValue("kind", kind);
                                }
                              }}
                              colorScheme={
                                field.value === kind ? "brand" : "white"
                              }
                              variant={
                                field.value === kind ? "solid" : "outline"
                              }
                              leftIcon={
                                kind === FilterKind.SIMPLE &&
                                form.values.advanced?.isDirty ? (
                                  <FaTriangleExclamation />
                                ) : undefined
                              }
                              borderRadius={"full"}
                              borderRightRadius={idx === 0 ? 0 : undefined}
                              borderRight={idx === 0 ? "none" : undefined}
                              borderLeftRadius={
                                idx === all.length - 1 ? 0 : undefined
                              }
                              borderLeft={
                                idx === all.length - 1 ? "none" : undefined
                              }
                              borderColor={
                                field.value !== kind
                                  ? "rgb(86, 87, 122)"
                                  : undefined
                              }
                            >
                              {displayTextForFilterKind(kind)}
                            </Button>
                          ))}
                        </ButtonGroup>
                      )}
                    </Field>
                  </Flex>
                  {props.values.kind === FilterKind.SIMPLE && (
                    <SimpleFiltersEditor />
                  )}
                  {props.values.kind === FilterKind.ADVANCED && (
                    <AdvancedFiltersEditor />
                  )}
                </>
              )}
            </VStack>

            <Modal
              isOpen={isOpenDiscardModal}
              onClose={onCloseDiscardModal}
              onEsc={onCloseDiscardModal}
              isCentered
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Discard Advanced Filters?</ModalHeader>
                <ModalBody>
                  <Text>
                    You changed the advanced filters. Switching to simple
                    filters will discard these changes. <br />
                    Are you sure you want to switch?
                  </Text>
                </ModalBody>
                <ModalFooter display={"flex"} flexDir={"row"} gap={2}>
                  <Button onClick={onCloseDiscardModal}>
                    Keep Advanced Filters
                  </Button>
                  <Button
                    onClick={() => {
                      onCloseDiscardModal();
                      props.setFieldValue("kind", FilterKind.SIMPLE);
                    }}
                    variant={"solid"}
                    colorScheme={"red"}
                  >
                    Switch To Simple Filters
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        );
      }}
    </Formik>
  );
};

const FilterFormSyncSimpleToAdvancedRules: React.FC<
  FormikProps<FilterFormData>
> = ({ values, setFieldValue }) => {
  useEffect(() => {
    if (values.isAll !== false || values.kind !== FilterKind.SIMPLE) {
      return;
    }

    // Create a rule group for each known platform, and one rule group for unknown platforms
    let perPlatformRuleGroupAndroid: AdvancedFiltersRuleGroup = {
      id: "platform-android",
      operator: MessageRuleGroupOperator.AND,
      rules: [],
      conditions: [],
    };
    let perPlatformRuleGroupIOS: AdvancedFiltersRuleGroup = {
      id: "platform-ios",
      operator: MessageRuleGroupOperator.AND,
      rules: [],
      conditions: [],
    };
    let perPlatformRuleGroupUnkown: AdvancedFiltersRuleGroup = {
      id: "platform-unknown",
      operator: MessageRuleGroupOperator.AND,
      rules: [],
      conditions: [],
    };
    let perPlatformRulesGroup: AdvancedFiltersRuleGroup = {
      id: "platform-rules",
      operator: MessageRuleGroupOperator.OR,
      rules: [],
      conditions: [],
    };

    // Per Platform - Android
    // If targeting only Android, apply only Android filters
    perPlatformRuleGroupAndroid.conditions!.push({
      id: "platform",
      systemVariable: MessageRuleSystemVariable.PLATFORM_NAME,
      comparator: MessageRuleComparator.EQUALS,
      userVariable: "Android",
    });

    if (values.simple?.platformVersionFilter?.isEnabled) {
      perPlatformRuleGroupAndroid.conditions!.push({
        id: "platform-version-android",
        systemVariable: MessageRuleSystemVariable.PLATFORM_VERSION,
        comparator: mapSimpleVersionFilterComparatorToRuleOperator(
          values.simple.platformVersionFilter.android?.comparator,
        ),
        userVariable:
          values.simple.platformVersionFilter.android?.version ?? "",
      });
    }

    if (values.simple?.appVersionFilter?.isEnabled) {
      perPlatformRuleGroupAndroid.conditions!.push({
        id: "app-version-android",
        systemVariable: MessageRuleSystemVariable.RELEASE_VERSION,
        comparator: mapSimpleVersionFilterComparatorToRuleOperator(
          values.simple.appVersionFilter.android?.comparator,
        ),
        userVariable: values.simple.appVersionFilter.android?.version ?? "",
      });
    }

    // Per Platform - IOS
    perPlatformRuleGroupIOS.conditions!.push({
      id: "platform",
      systemVariable: MessageRuleSystemVariable.PLATFORM_NAME,
      comparator: MessageRuleComparator.EQUALS,
      userVariable: "iOS",
    });

    if (values.simple?.platformVersionFilter?.isEnabled) {
      perPlatformRuleGroupIOS.conditions!.push({
        id: "platform-version-ios",
        systemVariable: MessageRuleSystemVariable.PLATFORM_VERSION,
        comparator: mapSimpleVersionFilterComparatorToRuleOperator(
          values.simple.platformVersionFilter.ios?.comparator,
        ),
        userVariable: values.simple.platformVersionFilter.ios?.version ?? "",
      });
    }

    if (values.simple?.appVersionFilter?.isEnabled) {
      perPlatformRuleGroupIOS.conditions!.push({
        id: "app-version-ios",
        systemVariable: MessageRuleSystemVariable.RELEASE_VERSION,
        comparator: mapSimpleVersionFilterComparatorToRuleOperator(
          values.simple.appVersionFilter.ios?.comparator,
        ),
        userVariable: values.simple.appVersionFilter.ios?.version ?? "",
      });
    }

    // Add the per-platform rule groups based on the target platform
    const isTargetingAll =
      values.simple?.platform === SimpleFiltersPlatform.ALL;
    const isTargetingOnlyAndroid =
      values.simple?.platform === SimpleFiltersPlatform.ANDROID;
    const isTargetingOnlyIOS =
      values.simple?.platform === SimpleFiltersPlatform.IOS;

    if (isTargetingAll) {
      // If targeting all platforms, apply a catch-all rule group
      perPlatformRuleGroupUnkown.conditions = [
        {
          id: "platform-unkown-not-android",
          comparator: MessageRuleComparator.IS_NOT_EQUAL,
          systemVariable: MessageRuleSystemVariable.PLATFORM_NAME,
          userVariable: "Android",
        },
        {
          id: "platform-unknown-not-ios",
          comparator: MessageRuleComparator.IS_NOT_EQUAL,
          systemVariable: MessageRuleSystemVariable.PLATFORM_NAME,
          userVariable: "iOS",
        },
      ];
      perPlatformRulesGroup.rules = [
        perPlatformRuleGroupAndroid,
        perPlatformRuleGroupIOS,
        perPlatformRuleGroupUnkown,
      ];
    } else if (isTargetingOnlyAndroid) {
      perPlatformRulesGroup.rules = [perPlatformRuleGroupAndroid];
    } else if (isTargetingOnlyIOS) {
      perPlatformRulesGroup.rules = [perPlatformRuleGroupIOS];
    }

    // Create the root filter group with the per-platform rules
    const rootFilterGroup: AdvancedFiltersRuleGroup = {
      id: "root",
      operator: MessageRuleGroupOperator.AND,
      rules: [perPlatformRulesGroup],
      conditions: [],
    };

    // -- Region Filter --
    if (values.simple?.regionFilter?.isEnabled) {
      const regionFiltersGroup: AdvancedFiltersRuleGroup = {
        id: "region",
        operator: MessageRuleGroupOperator.AND,
        rules: [],
        conditions: [],
      };
      // If the included region contains "ALL", we only need to exclude the excluded regions
      const includedRegions = values.simple.regionFilter?.included ?? [];
      const excludedRegions = values.simple.regionFilter?.excluded ?? [];
      if (!includedRegions.includes(SimpleFiltersRegion.ALL)) {
        for (const includedRegion of includedRegions) {
          regionFiltersGroup.conditions!.push({
            id: `region-included-${includedRegion}`,
            systemVariable: MessageRuleSystemVariable.LOCALE_REGION_CODE,
            comparator: MessageRuleComparator.EQUALS,
            userVariable: includedRegion,
          });
        }
      }
      for (const excludedRegion of excludedRegions) {
        regionFiltersGroup.conditions!.push({
          id: `region-excluded-${excludedRegion}`,
          systemVariable: MessageRuleSystemVariable.LOCALE_REGION_CODE,
          comparator: MessageRuleComparator.IS_NOT_EQUAL,
          userVariable: excludedRegion,
        });
      }

      // Add the region filter group to the root filter group
      rootFilterGroup.rules!.push(regionFiltersGroup);
    }

    // -- Language Filter --
    if (values.simple?.languageFilter?.isEnabled) {
      const languageFiltersGroup: AdvancedFiltersRuleGroup = {
        id: "language",
        operator: MessageRuleGroupOperator.AND,
        rules: [],
        conditions: [],
      };

      // If the included language contains "ALL", we only need to exclude the excluded languages
      const includedLanguages = values.simple.languageFilter?.included ?? [];
      const excludedLanguages = values.simple.languageFilter?.excluded ?? [];
      if (!includedLanguages.includes(SimpleFiltersLanguage.ALL)) {
        for (const includedLanguage of includedLanguages) {
          languageFiltersGroup.conditions!.push({
            id: `language-included-${includedLanguage}`,
            systemVariable: MessageRuleSystemVariable.LOCALE_LANGUAGE_CODE,
            comparator: MessageRuleComparator.EQUALS,
            userVariable: includedLanguage,
          });
        }
      }
      for (const excludedLanguage of excludedLanguages) {
        languageFiltersGroup.conditions!.push({
          id: `language-excluded-${excludedLanguage}`,
          systemVariable: MessageRuleSystemVariable.LOCALE_LANGUAGE_CODE,
          comparator: MessageRuleComparator.IS_NOT_EQUAL,
          userVariable: excludedLanguage,
        });
      }

      // Add the language filter group to the root filter group
      rootFilterGroup.rules!.push(languageFiltersGroup);
    }

    setFieldValue("advanced.root", rootFilterGroup);
    setFieldValue("advanced.isDirty", false);
  }, [values.isAll, values.kind, values.simple, setFieldValue]);

  return <></>;
};
