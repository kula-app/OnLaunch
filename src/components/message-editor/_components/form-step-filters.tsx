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
      // Reinitialize the form if the initial values change, e.g. when prefilling the form with an existing message
      enableReinitialize={true}
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

class SimpleFilterGroupIds {
  static ROOT = 0x1_000_000;

  static PLATFORM = 0x2_000_000;
  static PLATFORM_ANDROID = 0x2_001_000;
  static PLATFORM_IOS = 0x2_002_000;
  static PLATFORM_UNKNOWN = 0x2_999_000;

  static PLATFORM_RULES = 0x3_000_000;
  static PLATFORM_VERSION_ANDROID = 0x3_001_001;
  static APP_VERSION_ANDROID = 0x3_001_002;

  static PLATFORM_VERSION_IOS = 0x3_002_001;
  static APP_VERSION_IOS = 0x3_002_001;

  static PLATFORM_UNKNOWN_NOT_ANDROID = 0x3_999_001;
  static PLATFORM_UNKNOWN_NOT_IOS = 0x3_999_002;

  static REGION = 0x5_000_000;
  private static REGION_INCLUDED = SimpleFilterGroupIds.REGION | 0x0_002_000;
  private static REGION_EXCLUDED = SimpleFilterGroupIds.REGION | 0x0_001_000;
  static regionIncluded(region: SimpleFiltersRegion) {
    const idx = Object.values(SimpleFiltersRegion).indexOf(region);
    return SimpleFilterGroupIds.REGION_INCLUDED | idx;
  }
  static regionExcluded(region: SimpleFiltersRegion) {
    const idx = Object.values(SimpleFiltersRegion).indexOf(region);
    return SimpleFilterGroupIds.REGION_EXCLUDED | idx;
  }

  static LANGUAGE = 0x6_000_000;
  private static LANGUAGE_INCLUDED =
    SimpleFilterGroupIds.LANGUAGE | 0x0_002_000;
  private static LANGUAGE_EXCLUDED =
    SimpleFilterGroupIds.LANGUAGE | 0x0_001_000;
  static languageIncluded(language: SimpleFiltersLanguage) {
    const idx = Object.values(SimpleFiltersLanguage).indexOf(language);
    return SimpleFilterGroupIds.LANGUAGE_INCLUDED | idx;
  }
  static languageExcluded(language: SimpleFiltersLanguage) {
    const idx = Object.values(SimpleFiltersLanguage).indexOf(language);
    return SimpleFilterGroupIds.LANGUAGE_EXCLUDED | idx;
  }
}

const FilterFormSyncSimpleToAdvancedRules: React.FC<
  FormikProps<FilterFormData>
> = ({ values, setFieldValue }) => {
  useEffect(() => {
    if (values.isAll !== false || values.kind !== FilterKind.SIMPLE) {
      return;
    }

    // Create a rule group for each known platform, and one rule group for unknown platforms
    let perPlatformRuleGroupAndroid: AdvancedFiltersRuleGroup = {
      id: SimpleFilterGroupIds.PLATFORM_ANDROID,
      operator: MessageRuleGroupOperator.AND,
      groups: [],
      conditions: [],
    };
    let perPlatformRuleGroupIOS: AdvancedFiltersRuleGroup = {
      id: SimpleFilterGroupIds.PLATFORM_IOS,
      operator: MessageRuleGroupOperator.AND,
      groups: [],
      conditions: [],
    };
    let perPlatformRuleGroupUnkown: AdvancedFiltersRuleGroup = {
      id: SimpleFilterGroupIds.PLATFORM_UNKNOWN,
      operator: MessageRuleGroupOperator.AND,
      groups: [],
      conditions: [],
    };
    let perPlatformRulesGroup: AdvancedFiltersRuleGroup = {
      id: SimpleFilterGroupIds.PLATFORM_RULES,
      operator: MessageRuleGroupOperator.OR,
      groups: [],
      conditions: [],
    };

    // Per Platform - Android
    // If targeting only Android, apply only Android filters
    perPlatformRuleGroupAndroid.conditions!.push({
      id: SimpleFilterGroupIds.PLATFORM,
      systemVariable: MessageRuleSystemVariable.PLATFORM_NAME,
      comparator: MessageRuleComparator.EQUALS,
      userVariable: "Android",
    });

    if (values.simple?.platformVersionFilter?.isEnabled) {
      perPlatformRuleGroupAndroid.conditions!.push({
        id: SimpleFilterGroupIds.PLATFORM_VERSION_ANDROID,
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
        id: SimpleFilterGroupIds.APP_VERSION_ANDROID,
        systemVariable: MessageRuleSystemVariable.RELEASE_VERSION,
        comparator: mapSimpleVersionFilterComparatorToRuleOperator(
          values.simple.appVersionFilter.android?.comparator,
        ),
        userVariable: values.simple.appVersionFilter.android?.version ?? "",
      });
    }

    // Per Platform - IOS
    perPlatformRuleGroupIOS.conditions!.push({
      id: SimpleFilterGroupIds.PLATFORM,
      systemVariable: MessageRuleSystemVariable.PLATFORM_NAME,
      comparator: MessageRuleComparator.EQUALS,
      userVariable: "iOS",
    });

    if (values.simple?.platformVersionFilter?.isEnabled) {
      perPlatformRuleGroupIOS.conditions!.push({
        id: SimpleFilterGroupIds.PLATFORM_VERSION_IOS,
        systemVariable: MessageRuleSystemVariable.PLATFORM_VERSION,
        comparator: mapSimpleVersionFilterComparatorToRuleOperator(
          values.simple.platformVersionFilter.ios?.comparator,
        ),
        userVariable: values.simple.platformVersionFilter.ios?.version ?? "",
      });
    }

    if (values.simple?.appVersionFilter?.isEnabled) {
      perPlatformRuleGroupIOS.conditions!.push({
        id: SimpleFilterGroupIds.APP_VERSION_IOS,
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
          id: SimpleFilterGroupIds.PLATFORM_UNKNOWN_NOT_ANDROID,
          comparator: MessageRuleComparator.IS_NOT_EQUAL,
          systemVariable: MessageRuleSystemVariable.PLATFORM_NAME,
          userVariable: "Android",
        },
        {
          id: SimpleFilterGroupIds.PLATFORM_UNKNOWN_NOT_IOS,
          comparator: MessageRuleComparator.IS_NOT_EQUAL,
          systemVariable: MessageRuleSystemVariable.PLATFORM_NAME,
          userVariable: "iOS",
        },
      ];
      perPlatformRulesGroup.groups = [
        perPlatformRuleGroupAndroid,
        perPlatformRuleGroupIOS,
        perPlatformRuleGroupUnkown,
      ];
    } else if (isTargetingOnlyAndroid) {
      perPlatformRulesGroup.groups = [perPlatformRuleGroupAndroid];
    } else if (isTargetingOnlyIOS) {
      perPlatformRulesGroup.groups = [perPlatformRuleGroupIOS];
    }

    // Create the root filter group with the per-platform rules
    const rootFilterGroup: AdvancedFiltersRuleGroup = {
      id: SimpleFilterGroupIds.ROOT,
      operator: MessageRuleGroupOperator.AND,
      groups: [perPlatformRulesGroup],
      conditions: [],
    };

    // -- Region Filter --
    if (values.simple?.regionFilter?.isEnabled) {
      const regionFiltersGroup: AdvancedFiltersRuleGroup = {
        id: SimpleFilterGroupIds.REGION,
        operator: MessageRuleGroupOperator.AND,
        groups: [],
        conditions: [],
      };
      // If the included region contains "ALL", we only need to exclude the excluded regions
      const includedRegions = values.simple.regionFilter?.included ?? [];
      const excludedRegions = values.simple.regionFilter?.excluded ?? [];
      if (!includedRegions.includes(SimpleFiltersRegion.ALL)) {
        for (const includedRegion of includedRegions) {
          regionFiltersGroup.conditions!.push({
            id: SimpleFilterGroupIds.regionIncluded(includedRegion),
            systemVariable: MessageRuleSystemVariable.LOCALE_REGION_CODE,
            comparator: MessageRuleComparator.EQUALS,
            userVariable: includedRegion,
          });
        }
      }
      for (const excludedRegion of excludedRegions) {
        regionFiltersGroup.conditions!.push({
          id: SimpleFilterGroupIds.regionExcluded(excludedRegion),
          systemVariable: MessageRuleSystemVariable.LOCALE_REGION_CODE,
          comparator: MessageRuleComparator.IS_NOT_EQUAL,
          userVariable: excludedRegion,
        });
      }

      // Add the region filter group to the root filter group
      rootFilterGroup.groups!.push(regionFiltersGroup);
    }

    // -- Language Filter --
    if (values.simple?.languageFilter?.isEnabled) {
      const languageFiltersGroup: AdvancedFiltersRuleGroup = {
        id: SimpleFilterGroupIds.LANGUAGE,
        operator: MessageRuleGroupOperator.AND,
        groups: [],
        conditions: [],
      };

      // If the included language contains "ALL", we only need to exclude the excluded languages
      const includedLanguages = values.simple.languageFilter?.included ?? [];
      const excludedLanguages = values.simple.languageFilter?.excluded ?? [];
      if (!includedLanguages.includes(SimpleFiltersLanguage.ALL)) {
        for (const includedLanguage of includedLanguages) {
          languageFiltersGroup.conditions!.push({
            id: SimpleFilterGroupIds.languageIncluded(includedLanguage),
            systemVariable: MessageRuleSystemVariable.LOCALE_LANGUAGE_CODE,
            comparator: MessageRuleComparator.EQUALS,
            userVariable: includedLanguage,
          });
        }
      }
      for (const excludedLanguage of excludedLanguages) {
        languageFiltersGroup.conditions!.push({
          id: SimpleFilterGroupIds.languageExcluded(excludedLanguage),
          systemVariable: MessageRuleSystemVariable.LOCALE_LANGUAGE_CODE,
          comparator: MessageRuleComparator.IS_NOT_EQUAL,
          userVariable: excludedLanguage,
        });
      }

      // Add the language filter group to the root filter group
      rootFilterGroup.groups!.push(languageFiltersGroup);
    }

    setFieldValue("advanced.root", rootFilterGroup);
    setFieldValue("advanced.isDirty", false);
  }, [values.isAll, values.kind, values.simple, setFieldValue]);

  return <></>;
};
