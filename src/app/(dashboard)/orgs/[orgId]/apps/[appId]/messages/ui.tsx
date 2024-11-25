"use client";

import { useApp } from "@/api/apps/useApp";
import deleteMessage from "@/api/messages/deleteMessage";
import { useOrg } from "@/api/orgs/useOrg";
import { getAuthenticatedUserRoleInOrg } from "@/app/actions/get-authenticated-user-role-in-org";
import { getRequestHistoryOfApp } from "@/app/actions/get-request-history-of-app";
import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import RequestsChart from "@/components/request-chart";
import { ServerError } from "@/errors/server-error";
import { Message } from "@/models/message";
import type { RequestHistoryItem } from "@/models/request-history-item";
import Routes from "@/routes/routes";
import styles from "@/styles/Home.module.css";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  Skeleton,
  Stack,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Moment from "moment";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { MdDeleteForever, MdEdit } from "react-icons/md";

export const UI: React.FC<{
  orgId: number;
  appId: number;
}> = ({ orgId, appId }) => {
  const router = useRouter();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const [messageId, setMessageId] = useState(-1);

  const [showHistory, setShowHistory] = useState(false);

  const now = Moment.now();

  const { org, isError: isOrgError } = useOrg(orgId);
  const {
    app: data,
    isLoading,
    isError: isAppError,
    mutate,
  } = useApp(orgId, appId);

  const [dashboardData, setData] = useState<RequestHistoryItem[]>([]);

  useEffect(() => {
    // Use the abstracted function
    const fetchData = async () => {
      try {
        const response = await getRequestHistoryOfApp({ orgId, appId });
        if (response.error) {
          throw new ServerError(response.error.name, response.error.message);
        }
        setData(response.value.items);
      } catch (error) {
        toast({
          title: "Failed to fetch dashboard data!",
          description: "Please try again later",
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    };

    fetchData();
  }, [orgId, appId, toast]);

  const [authenticatedUserRole, setAuthenticatedUserRole] = useState<string>();
  const fetchAuthenticatedUserRole = useCallback(async () => {
    try {
      const response = await getAuthenticatedUserRoleInOrg(orgId);
      if (response.error) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setAuthenticatedUserRole(response.value);
    } catch (error) {
      toast({
        title: "Failed to fetch role!",
        description: "Please try again later",
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }, [orgId, toast]);
  useEffect(() => {
    if (!authenticatedUserRole) {
      fetchAuthenticatedUserRole();
    }
  }, [fetchAuthenticatedUserRole, authenticatedUserRole]);

  if (isOrgError || isAppError) return <div>Failed to load</div>;

  const messages = data?.messages?.filter((message) => {
    if (showHistory) {
      return new Date(message.endDate).getTime() < now;
    } else {
      return new Date(message.endDate).getTime() >= now;
    }
  });

  const totalSum = dashboardData.reduce(
    (sum, entry) => sum + Number(entry.count),
    0,
  );

  function handleDelete(messageId: number) {
    setMessageId(messageId);
    if (data && data.messages) {
      const message = data?.messages.find((x) => x.id == messageId);
      if (
        message &&
        Moment(message.startDate).isBefore(now) &&
        Moment(message.endDate).isAfter(now)
      ) {
        onOpen();
      } else {
        callDeleteMessage(messageId);
      }
    }
  }

  async function callDeleteMessage(messageId: number) {
    try {
      await deleteMessage(orgId, appId, messageId);

      mutate();

      toast({
        title: "Success!",
        description: `Message with id '${messageId}' successfully deleted.`,
        status: "success",
        isClosable: true,
        duration: 6000,
      });
    } catch (error) {
      toast({
        title: `Error while deleting message with id ${messageId}!`,
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  function navigateToEditMessagePage(messageId: number) {
    router.push(
      Routes.editMessageByOrgIdAndAppIdAndMessageId(orgId, appId, messageId),
    );
  }

  function navigateToNewMessagePage() {
    router.push(Routes.createNewMessageForOrgIdAndAppId(orgId, appId));
  }

  function navigateToAppSettingsPage() {
    router.push(Routes.appSettingsByOrgIdAndAppId(orgId, appId));
  }

  return (
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
        <main className={styles.main}>
          <Heading className="text-center">{data?.name}</Heading>
          {data?.role === "ADMIN" && (
            <Button
              colorScheme="blue"
              className="mt-8"
              onClick={navigateToAppSettingsPage}
            >
              App Settings
            </Button>
          )}
          {authenticatedUserRole === "ADMIN" && dashboardData.length > 0 && (
            <>
              <Heading className="text-center my-12">
                App requests in the past days
              </Heading>
              <RequestsChart requestData={dashboardData} />
              <Heading size="lg">Total requests: {totalSum}</Heading>
              <Text>in the last 31 days</Text>
            </>
          )}
          <div>
            <Button
              colorScheme="blue"
              className="mt-8"
              onClick={navigateToNewMessagePage}
            >
              New Message
            </Button>
          </div>
          <div>
            <Button
              variant="ghost"
              colorScheme="blue"
              className="mt-8"
              onClick={() => {
                setShowHistory(!showHistory);
              }}
            >
              {showHistory
                ? `show current messages (${
                    Number(data?.messages?.length) -
                    (messages ? messages.length : 0)
                  })`
                : `show history (${
                    Number(data?.messages?.length) -
                    (messages ? messages.length : 0)
                  })`}
            </Button>
          </div>
          <div>
            <Table
              sx={{ minWidth: 650, maxWidth: 1300 }}
              aria-label="simple table"
            >
              <Thead>
                <Tr>
                  <Th>
                    <strong>ID</strong>
                  </Th>
                  <Th></Th>
                  <Th>
                    <strong>Title</strong>
                  </Th>
                  <Th>
                    <strong>Body</strong>
                  </Th>
                  <Th>
                    <strong>Blocking</strong>
                  </Th>
                  <Th>
                    <strong>Start Date</strong>
                  </Th>
                  <Th>
                    <strong>End Date</strong>
                  </Th>
                  <Th>
                    <strong># Actions</strong>
                  </Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {data?.messages &&
                  messages &&
                  messages.map((message: Message, index: number) => {
                    return (
                      <Tr key={index}>
                        <Td>{message.id}</Td>
                        <Td>
                          <div className="flex justify-center">
                            {Moment(message.startDate).isBefore(now) &&
                              Moment(message.endDate).isAfter(now) && (
                                <Tooltip label="this message is currently displayed in apps">
                                  <Tag
                                    size={"md"}
                                    key={index}
                                    borderRadius="full"
                                    variant="solid"
                                    colorScheme="green"
                                  >
                                    live
                                  </Tag>
                                </Tooltip>
                              )}
                            {Moment(message.endDate).isBefore(now) && (
                              <Tooltip label="this message will not be displayed again in apps">
                                <Tag
                                  size={"md"}
                                  key={index}
                                  borderRadius="full"
                                  variant="outline"
                                  colorScheme="blackAlpha"
                                >
                                  over
                                </Tag>
                              </Tooltip>
                            )}
                            {Moment(message.startDate).isAfter(now) && (
                              <Tooltip label="this message will be displayed in apps in the future">
                                <Tag
                                  size={"md"}
                                  key={index}
                                  borderRadius="full"
                                  variant="outline"
                                  colorScheme="green"
                                >
                                  upcoming
                                </Tag>
                              </Tooltip>
                            )}
                          </div>
                        </Td>
                        <Td>{message.title}</Td>
                        <Td>
                          {message.body.length >= 70
                            ? message.body.slice(0, 50) + "..."
                            : message.body}
                        </Td>
                        <Td>
                          <div className="flex justify-center">
                            {String(message.isBlocking)}
                          </div>
                        </Td>
                        <Td>
                          {Moment(message.startDate).format(
                            "DD.MM.YYYY HH:mm:ss",
                          )}
                        </Td>
                        <Td>
                          {Moment(message.endDate).format(
                            "DD.MM.YYYY HH:mm:ss",
                          )}
                        </Td>
                        <Td>
                          <div className="flex justify-center">
                            {!!message.actions ? message.actions.length : 0}
                          </div>
                        </Td>
                        <Td>
                          <div className="flex flex-row">
                            <Tooltip label="edit">
                              <IconButton
                                className="mr-2"
                                aria-label={"view message details"}
                                onClick={() =>
                                  navigateToEditMessagePage(Number(message.id))
                                }
                              >
                                <MdEdit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip label="delete">
                              <IconButton
                                aria-label={"delete message"}
                                onClick={() => handleDelete(Number(message.id))}
                              >
                                <MdDeleteForever />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
              </Tbody>
            </Table>
            {isLoading && (
              <div className="w-full">
                <Stack>
                  <Skeleton height="60px" />
                  <Skeleton height="60px" />
                  <Skeleton height="60px" />
                </Stack>
              </div>
            )}
          </div>
          {data?.messages && messages && messages.length == 0 && (
            <p className="mt-4">no data to show</p>
          )}
          <AlertDialog
            isOpen={isOpen}
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isCentered
          >
            <AlertDialogOverlay />

            <AlertDialogContent>
              <AlertDialogHeader>
                {`Delete message with id '${messageId}'?`}
              </AlertDialogHeader>
              <AlertDialogCloseButton />
              <AlertDialogBody>
                This message is currently displayed in apps. Deletion cannot be
                undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  ml={3}
                  onClick={() => {
                    callDeleteMessage(messageId);
                    onClose();
                  }}
                >
                  Confirm
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </Container>
    </Flex>
  );
};

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: Routes.login({
          redirect: context.req.url,
        }),
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
