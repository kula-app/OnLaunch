import Moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../../../../../../styles/Home.module.css";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { getSession } from "next-auth/react";
import deleteMessage from "../../../../../../api/messages/deleteMessage";
import { useApp } from "../../../../../../api/apps/useApp";
import Routes from "../../../../../../routes/routes";
import { Message } from "../../../../../../models/message";
import {
  Button,
  IconButton,
  Stack,
  Skeleton,
  Table,
  Tag,
  Tbody,
  Th,
  Thead,
  Tooltip,
  Tr,
  Text,
  Td,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
} from "@chakra-ui/react";
import React from "react";

export default function MessagesOfAppPage() {
  const router = useRouter();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const orgId = Number(router.query.orgId);
  const appId = Number(router.query.appId);

  const [messageId, setMessageId] = useState(-1);

  const [showHistory, setShowHistory] = useState(false);

  const now = Moment.now();

  const { app: data, isLoading, isError, mutate } = useApp(orgId, appId);
  if (isError) return <div>Failed to load</div>;

  const messages = data?.messages?.filter((message) => {
    if (showHistory) {
      return new Date(message.endDate).getTime() < now;
    } else {
      return new Date(message.endDate).getTime() >= now;
    }
  });

  function navigateToEditMessagePage(messageId: number) {
    router.push(
      Routes.editMessageByOrgIdAndAppIdAndMessageId(orgId, appId, messageId)
    );
  }

  function navigateToNewMessagePage() {
    router.push(Routes.createNewMessageForOrgIdAndAppId(orgId, appId));
  }

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

  function navigateToAppSettingsPage() {
    router.push(Routes.appSettingsByOrgIdAndAppId(orgId, appId));
  }

  return (
    <>
      <div>
        <main className={styles.main}>
          <h1 className="text-3xl font-bold text-center">{data?.name}</h1>
          {data?.role === "ADMIN" && (
            <Button
              colorScheme="blue"
              className="mt-8"
              onClick={() => {
                navigateToAppSettingsPage();
              }}
            >
              App Settings
            </Button>
          )}
          <div>
            <Button
              colorScheme="blue"
              className="mt-8"
              onClick={() => {
                navigateToNewMessagePage();
              }}
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
                            {String(message.blocking)}
                          </div>
                        </Td>
                        <Td>
                          {Moment(message.startDate).format(
                            "DD.MM.YYYY HH:mm:ss"
                          )}
                        </Td>
                        <Td>
                          {Moment(message.endDate).format(
                            "DD.MM.YYYY HH:mm:ss"
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
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
