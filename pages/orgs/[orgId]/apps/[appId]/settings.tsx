import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Moment from "moment";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { MdDeleteForever } from "react-icons/md";
import createAppAdminToken from "../../../../../api/apps/adminTokens/createToken";
import deleteAppAdminToken from "../../../../../api/apps/adminTokens/deleteAppAdminToken";
import { useAppAdminTokens } from "../../../../../api/apps/adminTokens/useAppAdminTokens";
import deleteApp from "../../../../../api/apps/deleteApp";
import getApp from "../../../../../api/apps/getApp";
import updateApp from "../../../../../api/apps/updateApp";
import { App } from "../../../../../models/app";
import Routes from "../../../../../routes/routes";
import styles from "../../../../../styles/Home.module.css";

export default function EditAppPage() {
  const router = useRouter();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isAppDeletion, setIsAppDeletion] = useState(false);
  const [tokenIdToDelete, setTokenIdToDelete] = useState(-1);
  const [dialogHeaderText, setDialogHeaderText] = useState("");
  const cancelRef = React.useRef(null);

  const orgId = Number(router.query.orgId);
  const appId = Number(router.query.appId);

  const [appName, setAppName] = useState("");
  const [appKey, setAppKey] = useState("");

  // Options for the dropdown
  const options = [
    { label: "1 day", value: 24 * 60 * 60 }, // 1 day in seconds
    { label: "30 days", value: 30 * 24 * 60 * 60 }, // 30 days in seconds
    { label: "Unlimited", value: 0 }, // Unlimited
  ];
  const [timeToLive, setTimeToLive] = useState(options[0].value);

  const {
    appAdminTokens,
    isLoading: isAppAdminTokenLoading,
    mutate: appAdminTokenMutate,
  } = useAppAdminTokens(orgId, appId);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchAppData = async () => {
      try {
        const app = await getApp(orgId, appId);
        setAppKey(app.publicKey);

        if (app.role !== "ADMIN") {
          router.push(Routes.DASHBOARD);
        } else {
          fillForm(app);
        }
      } catch (error) {
        toast({
          title: "Error while fetching app data!",
          description: `${error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    };

    fetchAppData();
  }, [router.isReady, router, appId, orgId, toast]);

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await updateApp(orgId, appId, appName);

      toast({
        title: "Success!",
        description: "App has been edited.",
        status: "success",
        isClosable: true,
        duration: 6000,
      });

      navigateToAppDetailPage();
    } catch (error) {
      toast({
        title: "Error while editing app!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  function navigateToAppDetailPage() {
    router.push(Routes.getMessagesByOrgIdAndAppId(orgId, appId));
  }

  function navigateToAppsPage() {
    router.push(Routes.getOrgAppsByOrgId(Number(orgId)));
  }

  function fillForm(app: App) {
    // fill the form
    setAppName(app.name);
  }

  function handleDelete() {
    setIsAppDeletion(true);
    setDialogHeaderText(`Delete App with id '${appId}?`);

    onOpen();
  }

  function handleAppAdminTokenDelete(tokenId: number, token: string) {
    setIsAppDeletion(false);
    setTokenIdToDelete(tokenId);
    setDialogHeaderText(
      `Delete app token '${
        token.length > 15 ? token.substring(0, 15) + "..." : token
      }'`
    );

    onOpen();
  }

  async function callDeleteApp() {
    try {
      await deleteApp(orgId, appId);

      toast({
        title: "Success!",
        description: `App with id '${appId}'has been deleted.`,
        status: "success",
        isClosable: true,
        duration: 6000,
      });

      navigateToAppsPage();
    } catch (error) {
      toast({
        title: `Error while deleting app with id ${appId}!`,
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  function handleSelectionChange(event: ChangeEvent<HTMLSelectElement>) {
    setTimeToLive(Number(event.target.value));
  }

  async function delAppAdminToken() {
    try {
      await deleteAppAdminToken(orgId, appId, tokenIdToDelete);

      appAdminTokenMutate();

      toast({
        title: "Success!",
        description: "App admin token has been deleted!",
        status: "success",
        isClosable: true,
        duration: 6000,
      });
    } catch (error) {
      toast({
        title: `Error while deleting app admin token!`,
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  async function sendCreateNewToken() {
    try {
      await createAppAdminToken(orgId, appId, timeToLive);

      appAdminTokenMutate();

      toast({
        title: "Success!",
        description: "Created new organisation admin token",
        status: "success",
        isClosable: true,
        duration: 6000,
      });
    } catch (error) {
      toast({
        title: "Error while sending createCustomerPortalSession request!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  return (
    <>
      <div>
        <main className={styles.main}>
          <Heading className="text-center">Edit App</Heading>
          <form className="mt-8" id="appForm" onSubmit={submitHandler}>
            <FormControl className="mt-4">
              <FormLabel>Name</FormLabel>
              <Input
                required
                id="name"
                value={appName}
                onChange={(event) => setAppName(event.target.value)}
              />
            </FormControl>
            <div className="flex justify-center">
              <Button colorScheme="blue" className="mt-4" type="submit">
                update
              </Button>
            </div>
          </form>
          <Heading className="text-center mt-16">Client API Key</Heading>
          <div className="mt-8">
            <FormControl className="mt-4">
              <FormLabel>Public Key for Clients</FormLabel>
              <div className="flex flex-row">
                <Input disabled id="publicKey" value={appKey} />
                <Button
                  className="ml-2"
                  colorScheme="blue"
                  onClick={() => {
                    navigator.clipboard.writeText(appKey as string);
                    toast({
                      title: "Success!",
                      description: "Public key copied to clipboard.",
                      status: "success",
                      isClosable: true,
                      duration: 3000,
                    });
                  }}
                >
                  copy
                </Button>
              </div>
            </FormControl>
          </div>
          <Heading className="text-center mt-16 mb-8">Admin Api Tokens</Heading>
          {!isAppAdminTokenLoading && (
            <div>
              <Table
                className="mt-8"
                sx={{ minWidth: 650, maxWidth: 1000 }}
                aria-label="simple table"
              >
                <Thead>
                  <Tr>
                    <Th width="5%">
                      <strong>Id</strong>
                    </Th>
                    <Th>
                      <strong>Token</strong>
                    </Th>
                    <Th>
                      <strong>Expires On</strong>
                    </Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {appAdminTokens?.map((token, index) => {
                    return (
                      <Tr key={index}>
                        <Td>{token.id}</Td>
                        <Td>
                          {token.token.length > 15
                            ? token.token.substring(0, 15) + "..."
                            : token.token}
                        </Td>
                        <Td>
                          {token.expiryDate
                            ? Moment(token.expiryDate).format(
                                "DD.MM.YYYY HH:mm:ss"
                              )
                            : "never"}
                        </Td>
                        <Td>
                          <Button
                            className="ml-2"
                            colorScheme="blue"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                token.token as string
                              );
                              toast({
                                title: "Success!",
                                description: "Token copied to clipboard.",
                                status: "success",
                                isClosable: true,
                                duration: 3000,
                              });
                            }}
                          >
                            copy
                          </Button>
                          <Tooltip label="delete">
                            <IconButton
                              colorScheme="red"
                              aria-label={"delete organisation admin token"}
                              className="ml-4"
                              onClick={() =>
                                handleAppAdminTokenDelete(token.id, token.token)
                              }
                            >
                              <MdDeleteForever />
                            </IconButton>
                          </Tooltip>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
              {appAdminTokens?.length == 0 && (
                <Center className="my-4">
                  currently no active app admin tokens
                </Center>
              )}
              {isAppAdminTokenLoading && (
                <div>
                  <Heading className="text-center">loading ...</Heading>
                  <Spinner />
                </div>
              )}

              <Center className="mt-8 flex justify-center">
                <Flex>
                  <Select value={timeToLive} onChange={handleSelectionChange}>
                    {options.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <Button
                    colorScheme="blue"
                    variant="solid"
                    onClick={sendCreateNewToken}
                    className="ml-4"
                  >
                    add token
                  </Button>
                </Flex>
              </Center>
            </div>
          )}
          <Heading className="text-center mt-16">Delete App</Heading>
          <Button className="mt-8" colorScheme="red" onClick={handleDelete}>
            delete
          </Button>
          <AlertDialog
            isOpen={isOpen}
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isCentered
          >
            <AlertDialogOverlay />

            <AlertDialogContent>
              <AlertDialogHeader>{dialogHeaderText}</AlertDialogHeader>
              <AlertDialogCloseButton />
              <AlertDialogBody>
                This cannot be undone and restoring it is not possible.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  ml={3}
                  onClick={() => {
                    if (isAppDeletion) {
                      callDeleteApp();
                    } else {
                      delAppAdminToken();
                    }
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
