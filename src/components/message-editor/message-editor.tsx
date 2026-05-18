"use client";;
import { createMessage } from "@/app/actions/create-message";
import { LuCheck } from 'react-icons/lu';
import { deleteMessage } from "@/app/actions/delete-message";
import { getMessage } from "@/app/actions/get-message";
import { updateMessage } from "@/app/actions/update-message";
import { ConclusionFormStep } from "@/components/message-editor/_components/form-step-conclusion";
import { FormStepDraft } from "@/components/message-editor/_components/form-step-draft";
import { FormStepFilters } from "@/components/message-editor/_components/form-step-filters";
import { FormStepTimeframe } from "@/components/message-editor/_components/form-step-timeframe";
import { MessagePreview } from "@/components/message-editor/_components/message-preview";
import type {
  DraftFormActionData,
  DraftFormData,
} from "@/components/message-editor/_models/draft/draft-form-data";
import type { AdvancedFiltersRuleCondition } from "@/components/message-editor/_models/filters/advanced-filters-rule-condition";
import type { AdvancedFiltersRuleGroup } from "@/components/message-editor/_models/filters/advanced-filters-rule-group";
import { FilterKind } from "@/components/message-editor/_models/filters/filter-kind";
import type { FilterFormData } from "@/components/message-editor/_models/filters/filters-form-data";
import { SimpleFiltersAndroidVersion } from "@/components/message-editor/_models/filters/simple-filters-android-version";
import { SimpleFiltersComparator } from "@/components/message-editor/_models/filters/simple-filters-comparator";
import { SimpleFiltersIosVersion } from "@/components/message-editor/_models/filters/simple-filters-ios-version";
import { SimpleFiltersLanguage } from "@/components/message-editor/_models/filters/simple-filters-language";
import { SimpleFiltersPlatform } from "@/components/message-editor/_models/filters/simple-filters-platform";
import { SimpleFiltersRegion } from "@/components/message-editor/_models/filters/simple-filters-region";
import type { FormData } from "@/components/message-editor/_models/form-data";
import type { TimeframeFormData } from "@/components/message-editor/_models/timeframe/timeframe-form-data";
import { ServerError } from "@/errors/server-error";
import { ActionButtonDesign } from "@/models/action-button-design";
import type { App } from "@/models/app";
import type { Message } from "@/models/message";
import type { MessageAction } from "@/models/message-action";
import type { MessageRuleCondition } from "@/models/message-rule-condition";
import type { MessageRuleGroup } from "@/models/message-rule-group";
import { MessageRuleGroupOperator } from "@/models/message-rule-group-operator";
import type { Org } from "@/models/org";
import { Routes } from "@/routes/routes";
import { toaster } from "@/components/ui/toaster";
import {
  Steps,
  Box,
  Button,
  Card,
  Flex,
  Icon,
  Spacer,
  Text,
  useDisclosure,
  useSteps,
  type ButtonProps,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import type { FormikProps } from "formik";
import { useRouter } from "next/navigation";
import * as R from "ramda";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaQuestion } from "react-icons/fa6";

function mapDisplayCondition(
  condition: AdvancedFiltersRuleCondition,
): MessageRuleCondition {
  return {
    id: condition.id,
    systemVariable: condition.systemVariable,
    comparator: condition.comparator,
    userVariable: condition.userVariable,
  };
}

function mapDisplayRuleGroup(
  group: AdvancedFiltersRuleGroup,
): MessageRuleGroup {
  return {
    id: group.id,
    operator: group.operator,
    groups: group.groups?.map(mapDisplayRuleGroup) ?? [],
    conditions: group.conditions?.map(mapDisplayCondition) ?? [],
  };
}

export const MessageEditor: React.FC<{
  appId: App["id"];
  orgId: Org["id"];
  /**
   * The ID of the message to edit. If not provided, a new message will be created.
   */
  messageId: Message["id"] | undefined;
}> = ({ appId, orgId, messageId }) => {
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
  const stepsApi = useSteps({
    defaultStep: 0,
    count: steps.length
  });
  const activeStepId: FormDataStep["id"] | undefined = steps[activeStepIdx]?.id;

  const {
    open: isOpenDiscardModal,
    onOpen: onOpenDiscardModal,
    onClose: onCloseDiscardModal,
  } = useDisclosure();
  const {
    open: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();

  const [initialFormValues, setInitialFormValues] = useState<FormData>({
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
  });

  // Fetch the message to edit
  const fetchMessage = useCallback(async () => {
    if (!messageId) {
      return;
    }

    // Fetch the message to edit
    const result = await getMessage(messageId);
    if (!result.success) {
      throw new ServerError(result.error.name, result.error.message);
    }
    const message = result.value;

    // Map the message to the form data
    const draftFormValues: DraftFormData = {
      title: message.title,
      body: message.body,
      isBlocking: message.isBlocking,
      actions:
        message.actions?.map(
          (action): DraftFormActionData => ({
            id: action.id,
            actionType: action.actionType,
            buttonDesign: action.buttonDesign,
            title: action.title,
          }),
        ) ?? [],
    };

    const timeframeFormValues: TimeframeFormData = {
      startDate: new Date(message.startDate),
      endDate: new Date(message.endDate),
    };

    const filterFormValues: FilterFormData = {
      isAll: !message.ruleRootGroup,
      kind: message.ruleRootGroup ? FilterKind.ADVANCED : FilterKind.SIMPLE,
      simple: {
        platform: SimpleFiltersPlatform.ALL,
        platformVersionFilter: {
          isEnabled: false,
          android: {
            comparator: SimpleFiltersComparator.EXACTLY,
            version: Object.values(SimpleFiltersAndroidVersion)[0],
          },
          ios: {
            comparator: SimpleFiltersComparator.EXACTLY,
            version: Object.values(SimpleFiltersIosVersion)[0],
          },
        },
        appVersionFilter: {
          isEnabled: false,
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
          isEnabled: false,
          included: [SimpleFiltersRegion.ALL],
          excluded: [],
        },
        languageFilter: {
          isEnabled: false,
          included: [SimpleFiltersLanguage.ALL],
          excluded: [],
        },
      },
    };

    setInitialFormValues({
      draft: draftFormValues,
      timeframe: timeframeFormValues,
      filter: filterFormValues,
    });
  }, [messageId]);
  useEffect(() => {
    void fetchMessage();
  }, [fetchMessage]);

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

      let rules: MessageRuleGroup | undefined;
      if (!filterFormRef.current.values.isAll) {
        // The simple filter is converted to an advanced filter automatically by the UI,
        // therefore we can just use the advanced filter directly.
        rules = {
          id: 0,
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

      if (messageId) {
        const result = await updateMessage({
          id: messageId,

          title: draftFormRef.current.values.title,
          body: draftFormRef.current.values.body,
          actions: draftFormRef.current.values.actions.map(
            (action): MessageAction => ({
              id: action.id,
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
        if (!result.success) {
          throw new ServerError(result.error.name, result.error.message);
        }
      } else {
        const result = await createMessage({
          appId,

          title: draftFormRef.current.values.title,
          body: draftFormRef.current.values.body,
          actions: draftFormRef.current.values.actions.map((action) => ({
            actionType: action.actionType,
            buttonDesign: action.buttonDesign,
            title: action.title,
          })),

          isBlocking: draftFormRef.current.values.isBlocking,

          startDate: timeframeFormRef.current.values.startDate,
          endDate: timeframeFormRef.current.values.endDate,

          ruleRootGroup: rules,
        });
        if (!result.success) {
          throw new ServerError(result.error.name, result.error.message);
        }
      }

      // Go the conclusion step
      goToNext();
    } catch (error) {
      toaster.create({
        title: "Failed to create message!",
        description: `${error}`,
        type: "error",
        closable: true,
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    draftFormRef,
    timeframeFormRef,
    filterFormRef,
    appId,
    messageId,
    goToNext,
  ]);

  const [messagePreviewData, setMessagePreviewData] = useState<{
    isCloseButtonVisible: boolean;
    title: string;
    content: string;
    actions: {
      id: number;
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
        justifyContent={{ base: "start", sm: "center" }}
        alignItems={"center"}
        flex={1} // Setting flex to 1 to make the flex item grow and take up the remaining space
        mt={{ base: 12, md: 0 }}
        px={{ base: 4, md: 0 }}
      >
        <Card.Root
          mt={{ base: 8 }}
          p={{
            md: 4,
          }}
        >
          <Card.Body>
            <Box minW={"sm"} maxW={"lg"} alignSelf={"center"}>
              <Steps.RootProvider size={"sm"} gap={0} value={stepsApi}>
                {steps.map((step, index) => (
                  <Steps.Item key={step.id} gap={0}>
                    <Steps.Indicator
                      css={{
                        '& [data-status=complete] &': {
                          background: "blue.300",
                          borderColor: "blue.300",
                        },

                        '& [data-status=active] &': {
                          background: "brand.300",
                          borderColor: "brand.300",
                        },

                        '& [data-status=incomplete] &': {
                          background: "gray.300",
                          borderColor: "gray.300",
                        }
                      }}
                    >
                      <Steps.Status
                        complete={<LuCheck />}
                        current={<Icon color={"white"} asChild><FaQuestion /></Icon>}
                      />
                    </Steps.Indicator>
                    <Steps.Separator
                      _horizontal={{ ml: "0" }}
                      background={"gray.300"}
                    />
                  </Steps.Item>
                ))}
              </Steps.RootProvider>
            </Box>
            <Flex flexDir={"row"} align={"start"} gap={8} mt={4}>
              <FormStepDraft
                formRef={draftFormRef}
                initialValues={initialFormValues.draft}
                overflowY="auto"
                flex={1}
                hidden={activeStepId !== FormDataStepId.DRAFT}
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
                hidden={activeStepId !== FormDataStepId.TIMEFRAME}
              />
              <FormStepFilters
                formRef={filterFormRef}
                initialValues={initialFormValues.filter}
                overflowY="auto"
                flex={1}
                hidden={activeStepId !== FormDataStepId.FILTERS}
              />
              <ConclusionFormStep
                appId={appId}
                orgId={orgId}
                messageId={messageId}
                hidden={activeStepIdx < steps.length}
              />
              <Flex justifyContent={"center"}>
                <MessagePreview
                  isCloseButtonVisible={messagePreviewData.isCloseButtonVisible}
                  title={messagePreviewData.title}
                  content={messagePreviewData.content}
                  actions={messagePreviewData.actions}
                />
              </Flex>
            </Flex>
          </Card.Body>
          <Card.Footer display={"flex"} flexDir={"row"} gap={4}>
            {activeStepIdx === 0 && (
              <>
                <Button
                  colorPalette="gray"
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
                {messageId && (
                  <Button colorPalette="red" onClick={onOpenDeleteModal}>
                    Delete
                  </Button>
                )}
              </>
            )}
            {activeStepIdx > 0 && (
              <Button colorPalette="gray" onClick={() => goToPrevious()}>
                Back
              </Button>
            )}
            <Spacer />
            {activeStepId === FormDataStepId.DRAFT && (
              <Button
                colorPalette="blue"
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
            {activeStepId === FormDataStepId.TIMEFRAME && (
              <Button
                colorPalette="blue"
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
            {activeStepId === FormDataStepId.FILTERS && (
              <Button
                colorPalette="brand"
                type="submit"
                loading={isSubmitting}
                onClick={submit}
              >
                {messageId ? "Update" : "Create"}
              </Button>
            )}
          </Card.Footer>
        </Card.Root>
      </Flex>
      <Dialog.Root
        open={isOpenDiscardModal}
        onEscapeKeyDown={onCloseDiscardModal}
        placement='center'
        onOpenChange={e => {
          if (!e.open) {
            onCloseDiscardModal();
          }
        }}
      >
        <Portal>

          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>Discard Changes?</Dialog.Header>
              <Dialog.Body>
                <Text>
                  Are you sure you want to discard your changes?
                  <br />
                  Any unsaved data will be lost.
                </Text>
              </Dialog.Body>
              <Dialog.Footer display={"flex"} flexDir={"row"} gap={2}>
                <Button onClick={onCloseDiscardModal}>Cancel</Button>
                <Button
                  onClick={() => {
                    onCloseDiscardModal();
                    router.push(Routes.app({ orgId, appId }));
                  }}
                  variant={"solid"}
                  colorPalette={"red"}
                >
                  Discard
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>

        </Portal>
      </Dialog.Root>
      {messageId && (
        <Dialog.Root
          open={isDeleteModalOpen}
          onEscapeKeyDown={onCloseDeleteModal}
          placement='center'
          onOpenChange={e => {
            if (!e.open) {
              onCloseDeleteModal();
            }
          }}
        >
          <Portal>

            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>Delete Message?</Dialog.Header>
                <Dialog.Body>
                  <Text>
                    Are you sure you want to delete this message?
                    <br />
                    This action cannot be undone.
                  </Text>
                </Dialog.Body>
                <Dialog.Footer display={"flex"} flexDir={"row"} gap={2}>
                  <Button onClick={onCloseDeleteModal}>Cancel</Button>
                  <Button
                    onClick={async () => {
                      try {
                        const result = await deleteMessage(messageId);
                        if (!result.success) {
                          throw new ServerError(
                            result.error.name,
                            result.error.message,
                          );
                        }
                        router.push(Routes.messages({ orgId, appId }));
                      } catch (error) {
                        toaster.create({
                          title: "Failed to delete message!",
                          description: `${error}`,
                          type: "error",
                          closable: true,
                          duration: 6000,
                        });
                      } finally {
                        onCloseDeleteModal();
                      }
                    }}
                    variant={"solid"}
                    colorPalette={"red"}
                  >
                    Delete
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>

          </Portal>
        </Dialog.Root>
      )}
    </>
  );
};
