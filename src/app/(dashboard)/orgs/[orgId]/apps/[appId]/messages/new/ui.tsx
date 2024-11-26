"use client";

import { createMessage } from "@/app/actions/create-message";
import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { ServerError } from "@/errors/server-error";
import { ActionButtonDesign } from "@/models/action-button-design";
import type { MessageAction } from "@/models/message-action";
import type { MessageRuleCondition } from "@/models/message-rule-condition";
import type { MessageRuleGroup } from "@/models/message-rule-group";
import { MessageRuleGroupOperator } from "@/models/message-rule-group-operator";
import Routes from "@/routes/routes";
import { type ExcludeNestedIds } from "@/util/rule-evaluation/exclude-nested-ids";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Step,
  StepIcon,
  StepIndicator,
  Stepper,
  StepSeparator,
  StepStatus,
  Text,
  useDisclosure,
  useSteps,
  useToast,
  type ButtonProps,
} from "@chakra-ui/react";
import type { FormikProps } from "formik";
import { useRouter } from "next/navigation";
import * as R from "ramda";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { FaQuestion } from "react-icons/fa6";
import { ConclusionFormStep } from "./_components/form-step-conclusion";
import { FormStepDraft } from "./_components/form-step-draft";
import { FormStepFilters } from "./_components/form-step-filters";
import { FormStepTimeframe } from "./_components/form-step-timeframe";
import { MessagePreview } from "./_components/message-preview";
import type { DraftFormData } from "./_models/draft/draft-form-data";
import type { AdvancedFiltersRuleCondition } from "./_models/filters/advanced-filters-rule-condition";
import type { AdvancedFiltersRuleGroup } from "./_models/filters/advanced-filters-rule-group";
import { FilterKind } from "./_models/filters/filter-kind";
import type { FilterFormData } from "./_models/filters/filters-form-data";
import { SimpleFiltersAndroidVersion } from "./_models/filters/simple-filters-android-version";
import { SimpleFiltersComparator } from "./_models/filters/simple-filters-comparator";
import { SimpleFiltersIosVersion } from "./_models/filters/simple-filters-ios-version";
import { SimpleFiltersLanguage } from "./_models/filters/simple-filters-language";
import { SimpleFiltersPlatform } from "./_models/filters/simple-filters-platform";
import { SimpleFiltersRegion } from "./_models/filters/simple-filters-region";
import type { FormData } from "./_models/form-data";
import type { TimeframeFormData } from "./_models/timeframe/timeframe-form-data";

interface Props {
  orgId: number;
  appId: number;
}

function mapDisplayCondition(
  condition: AdvancedFiltersRuleCondition,
): ExcludeNestedIds<MessageRuleCondition> {
  return {
    systemVariable: condition.systemVariable,
    comparator: condition.comparator,
    userVariable: condition.userVariable,
  };
}

function mapDisplayRuleGroup(
  group: AdvancedFiltersRuleGroup,
): ExcludeNestedIds<MessageRuleGroup> {
  return {
    operator: group.operator,
    groups: group.groups?.map(mapDisplayRuleGroup) ?? [],
    conditions: group.conditions?.map(mapDisplayCondition) ?? [],
  };
}

export const UI: React.FC<Props> = ({ orgId, appId }) => {
  const toast = useToast();
  const router = useRouter();

  enum FormDataStepId {
    DRAFT = "draft",
    TIMEFRAME = "timeframe",
    FILTERS = "filters",
  }
  interface FormDataStep {
    id: FormDataStepId;
  }
  const steps: FormDataStep[] = [
    { id: FormDataStepId.DRAFT },
    { id: FormDataStepId.TIMEFRAME },
    { id: FormDataStepId.FILTERS },
  ];
  const {
    activeStep: activeStepIdx,
    goToNext,
    goToPrevious,
  } = useSteps({
    index: 0,
    count: steps.length,
  });
  const activeStep: FormDataStep | undefined = steps[activeStepIdx];

  const {
    isOpen: isOpenDiscardModal,
    onOpen: onOpenDiscardModal,
    onClose: onCloseDiscardModal,
  } = useDisclosure();

  const initialFormValues: FormData = {
    draft: {
      title: "",
      body: "",
      isBlocking: false,
      actions: [],
    },
    timeframe: {
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
    },
    filter: {
      isAll: true,
      kind: FilterKind.SIMPLE,
      // The default values of the simple filter are defined to be the most inclusive, so users can reduce the
      // target audience rather than having to include build up the target audience from scratch.
      simple: {
        platform: SimpleFiltersPlatform.ALL,
        platformVersionFilter: {
          isEnabled: true,
          android: {
            comparator: SimpleFiltersComparator.EXACTLY,
            // Use the first value of the enum as the default value, because it is the latest version
            version: Object.values(SimpleFiltersAndroidVersion)[0],
          },
          ios: {
            comparator: SimpleFiltersComparator.EXACTLY,
            // Use the first value of the enum as the default value, because it is the latest version
            version: Object.values(SimpleFiltersIosVersion)[0],
          },
        },
        appVersionFilter: {
          isEnabled: true,
          android: {
            comparator: SimpleFiltersComparator.EXACTLY,
            version: "",
          },
          ios: {
            comparator: SimpleFiltersComparator.EXACTLY,
            version: "",
          },
        },
        regionFilter: {
          isEnabled: true,
          // By default it should include all regions, so users can easily exclude regions if needed
          included: [SimpleFiltersRegion.ALL],
          excluded: [],
        },
        languageFilter: {
          isEnabled: true,
          // By default it should include all languages, so users can easily exclude languages if needed
          included: [SimpleFiltersLanguage.ALL],
          excluded: [],
        },
      },
    },
  };

  const draftFormRef = useRef<FormikProps<DraftFormData>>(null);
  const timeframeFormRef = useRef<FormikProps<TimeframeFormData>>(null);
  const filterFormRef = useRef<FormikProps<FilterFormData>>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      if (
        !draftFormRef.current ||
        !timeframeFormRef.current ||
        !filterFormRef.current
      ) {
        throw new Error("Form refs are not initialized.");
      }

      let rules: ExcludeNestedIds<MessageRuleGroup> | undefined;
      if (!filterFormRef.current.values.isAll) {
        // The simple filter is converted to an advanced filter automatically by the UI,
        // therefore we can just use the advanced filter directly.
        rules = {
          operator: MessageRuleGroupOperator.AND,
          groups:
            filterFormRef.current.values.advanced?.root?.groups?.map(
              mapDisplayRuleGroup,
            ) ?? [],
          conditions:
            filterFormRef.current.values.advanced?.root?.conditions?.map(
              mapDisplayCondition,
            ) ?? [],
        };
      }

      const result = await createMessage({
        appId,

        title: draftFormRef.current.values.title,
        body: draftFormRef.current.values.body,
        actions: draftFormRef.current.values.actions.map(
          (action): MessageAction => ({
            actionType: action.actionType,
            buttonDesign: action.buttonDesign,
            title: action.title,
          }),
        ),

        isBlocking: draftFormRef.current.values.isBlocking,

        startDate: timeframeFormRef.current.values.startDate,
        endDate: timeframeFormRef.current.values.endDate,

        ruleRootGroup: rules,
      });
      if (result.error) {
        throw new ServerError(result.error.name, result.error.message);
      }

      // Go the conclusion step
      goToNext();
    } catch (error) {
      toast({
        title: "Error while creating new organisation!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [toast, draftFormRef, timeframeFormRef, filterFormRef, appId, goToNext]);

  const [messagePreviewData, setMessagePreviewData] = useState<{
    isCloseButtonVisible: boolean;
    title: string;
    content: string;
    actions: {
      id: string;
      label: string;
      variant: ButtonProps["variant"];
    }[];
  }>({
    isCloseButtonVisible: false,
    title: "",
    content: "",
    actions: [],
  });

  return (
    <>
      <Flex
        direction={"column"}
        align={"stretch"}
        minH={{ base: 0, sm: "100vh" }}
      >
        <ConfiguredNavigationBar
          items={[
            { kind: "orgs" },
            { kind: "org", orgId },
            { kind: "apps", orgId },
            { kind: "app", orgId, appId },
            { kind: "messages", orgId, appId },
            { kind: "create-message", orgId, appId },
          ]}
        />
        <Flex
          direction={"column"}
          justifyContent={{ base: "start", sm: "center" }}
          alignItems={"center"}
          flex={1} // Setting flex to 1 to make the flex item grow and take up the remaining space
          mt={{ base: 12, md: 0 }}
          px={{ base: 4, md: 0 }}
        >
          <Card
            mt={{ base: 8 }}
            p={{
              md: 4,
            }}
          >
            <CardBody>
              <Box minW={"sm"} maxW={"lg"} alignSelf={"center"}>
                <Stepper index={activeStepIdx} size={"sm"} gap={0}>
                  {steps.map((step, index) => (
                    <Step key={step.id} gap={0}>
                      <StepIndicator
                        sx={{
                          "[data-status=complete] &": {
                            background: "blue.300",
                            borderColor: "blue.300",
                          },
                          "[data-status=active] &": {
                            background: "brand.300",
                            borderColor: "brand.300",
                          },
                          "[data-status=incomplete] &": {
                            background: "gray.300",
                            borderColor: "gray.300",
                          },
                        }}
                      >
                        <StepStatus
                          complete={<StepIcon />}
                          active={<Icon as={FaQuestion} color={"white"} />}
                        />
                      </StepIndicator>
                      <StepSeparator
                        _horizontal={{ ml: "0" }}
                        background={"gray.300"}
                      />
                    </Step>
                  ))}
                </Stepper>
              </Box>
              <Flex flexDir={"row"} align={"start"} gap={8} mt={4}>
                <FormStepDraft
                  formRef={draftFormRef}
                  initialValues={initialFormValues.draft}
                  overflowY="auto"
                  flex={1}
                  hidden={activeStep?.id !== FormDataStepId.DRAFT}
                  onValuesChange={(values) => {
                    const updatedMessagePreviewData = {
                      isCloseButtonVisible: !values.isBlocking,
                      title: values.title ?? "",
                      content: values.body ?? "",
                      actions:
                        values.actions.map((action) => {
                          switch (action.buttonDesign) {
                            case ActionButtonDesign.FILLED:
                              return {
                                id: action.id,
                                label: action.title,
                                variant: "solid",
                              };
                            case ActionButtonDesign.OUTLINE:
                              return {
                                id: action.id,
                                label: action.title,
                                variant: "outline",
                              };
                            default:
                              return {
                                id: action.id,
                                label: action.title,
                                variant: "solid",
                              };
                          }
                        }) ?? [],
                    };
                    if (
                      !R.equals(updatedMessagePreviewData, messagePreviewData)
                    ) {
                      setMessagePreviewData(updatedMessagePreviewData);
                    }
                  }}
                />
                <FormStepTimeframe
                  formRef={timeframeFormRef}
                  initialValues={initialFormValues.timeframe}
                  overflowY="auto"
                  flex={1}
                  hidden={activeStep?.id !== FormDataStepId.TIMEFRAME}
                />
                <FormStepFilters
                  formRef={filterFormRef}
                  initialValues={initialFormValues.filter}
                  overflowY="auto"
                  flex={1}
                  hidden={activeStep?.id !== FormDataStepId.FILTERS}
                />
                <ConclusionFormStep
                  appId={appId}
                  orgId={orgId}
                  hidden={activeStepIdx < steps.length}
                />
                <Flex justifyContent={"center"}>
                  <MessagePreview
                    isCloseButtonVisible={
                      messagePreviewData.isCloseButtonVisible
                    }
                    title={messagePreviewData.title}
                    content={messagePreviewData.content}
                    actions={messagePreviewData.actions}
                  />
                </Flex>
              </Flex>
            </CardBody>
            <CardFooter display={"flex"} flexDir={"row"} gap={4}>
              {activeStepIdx === 0 && (
                <Button
                  colorScheme="gray"
                  onClick={() => {
                    // If the form is dirty, we want to show a confirmation modal to confirm discarding changes
                    if (
                      draftFormRef.current?.dirty ||
                      timeframeFormRef.current?.dirty ||
                      filterFormRef.current?.dirty
                    ) {
                      onOpenDiscardModal();
                    } else {
                      router.push(Routes.app({ orgId, appId }));
                    }
                  }}
                >
                  Cancel
                </Button>
              )}
              {activeStepIdx > 0 && (
                <Button colorScheme="gray" onClick={() => goToPrevious()}>
                  Back
                </Button>
              )}
              <Spacer />
              {activeStep?.id === FormDataStepId.DRAFT && (
                <Button
                  colorScheme="blue"
                  onClick={async () => {
                    if (!draftFormRef.current) {
                      return;
                    }
                    await draftFormRef.current.submitForm();
                    if (draftFormRef.current.isValid) {
                      goToNext();
                    }
                  }}
                >
                  Next
                </Button>
              )}
              {activeStep?.id === FormDataStepId.TIMEFRAME && (
                <Button
                  colorScheme="blue"
                  onClick={async () => {
                    if (!timeframeFormRef.current) {
                      return;
                    }
                    timeframeFormRef.current.submitForm();
                    if (timeframeFormRef.current.isValid) {
                      goToNext();
                    }
                  }}
                >
                  Next
                </Button>
              )}
              {activeStep?.id === FormDataStepId.FILTERS && (
                <Button
                  colorScheme="brand"
                  type="submit"
                  isLoading={isSubmitting}
                  onClick={submit}
                >
                  Save
                </Button>
              )}
            </CardFooter>
          </Card>
        </Flex>
      </Flex>

      <Modal
        isOpen={isOpenDiscardModal}
        onClose={onCloseDiscardModal}
        onEsc={onCloseDiscardModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Discard Changes?</ModalHeader>
          <ModalBody>
            <Text>
              Are you sure you want to discard your changes?
              <br />
              Any unsaved data will be lost.
            </Text>
          </ModalBody>
          <ModalFooter display={"flex"} flexDir={"row"} gap={2}>
            <Button onClick={onCloseDiscardModal}>Cancel</Button>
            <Button
              onClick={() => {
                onCloseDiscardModal();
                router.push(Routes.app({ orgId, appId }));
              }}
              variant={"solid"}
              colorScheme={"red"}
            >
              Discard
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
