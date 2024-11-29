"use client";

import { deleteMessage } from "@/app/actions/delete-message";
import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { MessageList } from "@/components/message-list";
import { useMessages } from "@/hooks/use-messages";
import { useValueDisclosure } from "@/hooks/use-value-disclosure";
import { Message } from "@/models/message";
import Routes from "@/routes/routes";
import { truncateString } from "@/util/truncate-string";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Spacer,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa6";

export const UI: React.FC<{
  orgId: number;
  appId: number;
}> = ({ orgId, appId }) => {
  const router = useRouter();
  const toast = useToast();

  const {
    isLoading: isLoadingActiveMessages,
    messages: activeMessages,
    refresh: refreshActiveMessages,
  } = useMessages({
    appId,
    filter: "active",
  });
  const {
    isLoading: isLoadingPlannedMessages,
    messages: plannedMessages,
    refresh: refreshPlannedMessages,
  } = useMessages({
    appId,
    filter: "planned",
  });
  const {
    isLoading: isLoadingPastMessages,
    messages: pastMessages,
    refresh: refreshPastMessages,
  } = useMessages({
    appId,
    filter: "past",
  });

  // Schedule a refresh of the messages when the list is expected to change based on the timestamps
  const [refreshTimestamp, setRefreshTimestamp] = useState<Date | null>();
  useEffect(() => {
    // Find the closest timestamp that will be in the past soon
    // For active messages this is the closes end date
    // For planned messages this is the closest start date

    // Note: Active messages are expected to have future end dates.
    const closestActiveMessageEndDate = activeMessages?.reduce(
      (prev: Date | undefined, message) => {
        if (!prev) {
          return message.endDate;
        }
        if (message.endDate.getTime() < prev.getTime()) {
          return message.endDate;
        }
        return prev;
      },
      undefined,
    );
    // Note: Planned messages are expected to have future start dates.
    const closestPlannedMessageStartDate = plannedMessages?.reduce(
      (prev: Date | undefined, message) => {
        if (!prev) {
          return message.startDate;
        }
        if (message.startDate.getTime() < prev.getTime()) {
          return message.startDate;
        }
        return prev;
      },
      undefined,
    );

    let timestamp: Date;
    if (closestActiveMessageEndDate && closestPlannedMessageStartDate) {
      timestamp =
        closestActiveMessageEndDate.getTime() <
        closestPlannedMessageStartDate.getTime()
          ? closestActiveMessageEndDate
          : closestPlannedMessageStartDate;
    } else if (closestActiveMessageEndDate) {
      timestamp = closestActiveMessageEndDate;
    } else if (closestPlannedMessageStartDate) {
      timestamp = closestPlannedMessageStartDate;
    } else {
      return;
    }

    setRefreshTimestamp(timestamp);

    // Create a timeout to refresh the messages at the closest timestamp
    const timeout = setTimeout(() => {
      refreshActiveMessages();
      refreshPlannedMessages();
      refreshPastMessages();

      toast({
        title: "Messages refreshed!",
        description: `Messages have been refreshed.`,
        status: "info",
        isClosable: true,
        duration: 6000,
      });
    }, timestamp.getTime() - Date.now());

    // Clear the timeout when the component is unmounted
    return () => clearTimeout(timeout);
  }, [
    activeMessages,
    plannedMessages,
    refreshActiveMessages,
    refreshPastMessages,
    refreshPlannedMessages,
    toast,
  ]);

  const {
    isOpen,
    onClose,
    value: messageToDelete,
    setValue: setMessageToDelete,
  } = useValueDisclosure<Message>();
  const cancelRef = useRef(null);

  const callDeleteMessage = useCallback(async () => {
    if (!messageToDelete) {
      return;
    }
    try {
      await deleteMessage(messageToDelete.id);
      refreshActiveMessages();
      refreshPlannedMessages();
      refreshPastMessages();

      toast({
        title: "Success!",
        description: `Message with id '${messageToDelete}' successfully deleted.`,
        status: "success",
        isClosable: true,
        duration: 6000,
      });
    } catch (error) {
      toast({
        title: `Error while deleting message with id ${messageToDelete}!`,
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }, [
    messageToDelete,
    refreshActiveMessages,
    refreshPlannedMessages,
    refreshPastMessages,
    toast,
  ]);

  return (
    <>
      <Flex direction={"column"} minH={"100vh"}>
        <ConfiguredNavigationBar
          items={[
            { kind: "orgs" },
            { kind: "org", orgId: orgId },
            { kind: "apps", orgId: orgId },
            { kind: "app", orgId: orgId, appId: appId },
            { kind: "messages", orgId: orgId, appId: appId },
          ]}
        />
        <Container maxW={"6xl"}>
          <VStack p={4} w={"full"} gap={8}>
            <Heading size={"lg"} as={"h1"} color={"white"} w={"full"}>
              Messages
            </Heading>
            <Box w={"full"}>
              <HStack w={"full"} mb={4}>
                <Heading size={"md"} as={"h2"} color={"white"}>
                  Active Messages
                </Heading>
                <Spacer />
                <Button
                  leftIcon={<FaPlus />}
                  variant={"solid"}
                  colorScheme={"brand"}
                  onClick={() =>
                    router.push(
                      Routes.createNewMessageForOrgIdAndAppId(orgId, appId),
                    )
                  }
                >
                  Create Message
                </Button>
              </HStack>
              <MessageList
                isLoading={isLoadingActiveMessages}
                messages={activeMessages ?? []}
                editMessage={(message) =>
                  router.push(
                    Routes.editMessageByOrgIdAndAppIdAndMessageId(
                      orgId,
                      appId,
                      message.id,
                    ),
                  )
                }
                deleteMessage={(message) => {
                  setMessageToDelete(message);
                }}
              />
            </Box>
            <Box w={"full"}>
              <Heading size={"md"} as={"h2"} color={"white"} mb={4}>
                Planned Messages
              </Heading>
              <MessageList
                isLoading={isLoadingPlannedMessages}
                messages={plannedMessages ?? []}
                editMessage={(message) =>
                  router.push(
                    Routes.editMessageByOrgIdAndAppIdAndMessageId(
                      orgId,
                      appId,
                      message.id,
                    ),
                  )
                }
                deleteMessage={(messageId) => {
                  setMessageToDelete(messageId);
                }}
              />
            </Box>
            <Box w={"full"}>
              <Heading size={"md"} as={"h2"} color={"white"} mb={4}>
                Past Messages
              </Heading>
              <MessageList
                isLoading={isLoadingPastMessages}
                messages={pastMessages ?? []}
                editMessage={(message) =>
                  router.push(
                    Routes.editMessageByOrgIdAndAppIdAndMessageId(
                      orgId,
                      appId,
                      message.id,
                    ),
                  )
                }
                deleteMessage={(messageId) => {
                  setMessageToDelete(messageId);
                }}
              />
            </Box>
            <Text color={"white"} fontSize={12}>
              Automatic refreshing messages at{" "}
              {refreshTimestamp?.toLocaleString()}.
            </Text>
          </VStack>
        </Container>
      </Flex>

      <AlertDialog
        isOpen={isOpen}
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Delete Message?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            <Text>Are you sure you want to delete this message:</Text>
            <Text my={4}>
              <strong>{messageToDelete?.title}</strong>
              <br />
              {truncateString(messageToDelete?.body ?? "", 70)}
            </Text>
            <Text>This action can not be undone.</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <HStack>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  callDeleteMessage();
                  onClose();
                }}
              >
                Delete
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
