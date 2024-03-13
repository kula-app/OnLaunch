import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Select,
  Spinner,
  Stack,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { MdDeleteForever } from "react-icons/md";
import createOrgAdminToken from "../../../api/orgs/admin/tokens/createToken";
import deleteOrgAdminToken from "../../../api/orgs/admin/tokens/deleteOrgAdminToken";
import { useOrgAdminTokens } from "../../../api/orgs/admin/tokens/useOrgAdminTokens";
import deleteOrg from "../../../api/orgs/deleteOrg";
import deleteUserFromOrg from "../../../api/orgs/deleteUserFromOrg";
import getOrg from "../../../api/orgs/getOrg";
import inviteUser from "../../../api/orgs/inviteUser";
import updateOrg from "../../../api/orgs/updateOrg";
import updateUserInviteRoleInOrg from "../../../api/orgs/updateUserInviteRoleInOrg";
import updateUserRoleInOrg from "../../../api/orgs/updateUserRoleInOrg";
import { useOrg } from "../../../api/orgs/useOrg";
import { useUsers } from "../../../api/orgs/useUsers";
import createCustomerPortalSession from "../../../api/stripe/createCustomerPortalSession";
import getSubscriptions from "../../../api/stripe/getSubscriptions";
import resetOrgInvitationToken from "../../../api/tokens/resetOrgInvitationToken";
import { loadConfig } from "../../../config/loadConfig";
import { Org } from "../../../models/org";
import { Subscription } from "../../../models/subscription";
import Routes from "../../../routes/routes";
import styles from "../../../styles/Home.module.css";
import { getColorLabel, translateSubName } from "../../../util/nameTag";

export default function EditOrgPage() {
  const router = useRouter();
  const toast = useToast();
  const stripeConfig = loadConfig().client.stripeConfig;

  const {
    isOpen: isOrgDeletionOpen,
    onOpen: onOrgDeletionOpen,
    onClose: onOrgDeletionClose,
  } = useDisclosure();
  const cancelOrgDeletionRef = React.useRef(null);

  const [tokenIdToDelete, setTokenIdToDelete] = useState(-1);
  const [subtextOfTokenToDelete, setSubtextOfTokenToDelete] = useState("");
  const {
    isOpen: isTokenDeletionOpen,
    onOpen: onTokenDeletionOpen,
    onClose: onTokenDeletionClose,
  } = useDisclosure();
  const cancelTokenDeletionRef = React.useRef(null);

  const [tokenLabel, setTokenLabel] = useState("");

  const [subs, setSubs] = useState<Subscription[]>();
  const [loading, setLoading] = useState(true);

  const orgId = Number(router.query.orgId);

  const [orgName, setOrgName] = useState("");
  const [isCustomer, setIsCustomer] = useState(false);

  const roles = ["ADMIN", "USER"];
  const [baseUrl, setBaseUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchOrgData = async () => {
      try {
        const org = await getOrg(orgId);
        fillForm(org);
        setIsCustomer(!!org.customer);
      } catch (error) {
        toast({
          title: "Error while fetching organisation!",
          description: `${error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    };

    fetchOrgData();

    const fetchUserSubscriptions = async () => {
      try {
        setSubs(await getSubscriptions(orgId));
      } catch (error) {
        toast({
          title: "Error while fetching user data!",
          description: `${error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
      setLoading(false);
    };

    if (stripeConfig.isEnabled) {
      fetchUserSubscriptions();
    }
  }, [router.isReady, orgId, toast, stripeConfig.isEnabled]);

  const { data: session } = useSession();

  const { org, isError: orgError } = useOrg(orgId);
  const {
    users,
    isError: userError,
    isLoading: isUserLoading,
    mutate: userMutate,
  } = useUsers(orgId);
  const {
    orgAdminTokens,
    isError: orgAdminTokenError,
    isLoading: isOrgAdminTokenLoading,
    mutate: orgAdminTokenMutate,
  } = useOrgAdminTokens(orgId);

  if (userError || orgError || orgAdminTokenError)
    return <div>Failed to load</div>;

  let userRole = "";
  if (Array.isArray(users) && users.length > 0) {
    userRole = users.find((i) => i.email === session?.user?.email)
      ?.role as string;
  } else if (!isUserLoading) {
    // this case should never happen, at least one user has to be in each organisation
    toast({
      title: "Error!",
      description:
        "An error occurred trying to access this page. You will be navigated to the dashboard.",
      status: "error",
      isClosable: true,
      duration: 6000,
    });
    navigateToDashboardPage();
  }

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // load data from form
    let newOrg: Org = {
      id: Number(router.query.orgId),
      name: orgName,
    };

    try {
      await updateOrg(newOrg);

      toast({
        title: "Success!",
        description: "Organisation has been updated.",
        status: "success",
        isClosable: true,
        duration: 6000,
      });

      navigateToDashboardPage();
    } catch (error) {
      toast({
        title: "Error while editing organisation!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  function navigateToUpgradePage() {
    router.push(Routes.getOrgUpgradeByOrgId(orgId));
  }

  function navigateToDashboardPage() {
    router.push(Routes.DASHBOARD);
  }

  function fillForm(org: Org) {
    // fill the form
    setOrgName(org.name);
  }

  async function removeUser(userEmail: string) {
    try {
      await deleteUserFromOrg(orgId, userEmail);

      if (userEmail === session?.user?.email) {
        navigateToDashboardPage();
      } else {
        userMutate();

        toast({
          title: "Success",
          description: "User has been removed from organisation!",
          status: "success",
          isClosable: true,
          duration: 6000,
        });
      }
    } catch (error) {
      toast({
        title: "Error while removing user!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  async function resetInvitation() {
    try {
      await resetOrgInvitationToken(org?.invitationToken as string);

      toast({
        title: "Success!",
        description: "Invitation link has been changed.",
        status: "success",
        isClosable: true,
        duration: 6000,
      });
    } catch (error) {
      toast({
        title: "Error while changing invitation link!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  async function userInviteHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await inviteUser(orgId, userEmail);

      toast({
        title: "Success!",
        description: "User has been invited.",
        status: "success",
        isClosable: true,
        duration: 6000,
      });

      setUserEmail("");
      userMutate();
    } catch (error) {
      toast({
        title: "Error while inviting new user!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  async function handleRoleChange(
    index: number,
    event: ChangeEvent<HTMLSelectElement>
  ) {
    if (!users) {
      return;
    }

    let user = [...users][index];

    try {
      if (user.id === -1) {
        await updateUserInviteRoleInOrg(
          orgId,
          user.email,
          event.target.value as string
        );
      } else {
        await updateUserRoleInOrg(
          orgId,
          Number(user.id),
          event.target.value as string
        );
      }

      userMutate();

      toast({
        title: "Success!",
        description: `User ${user.id === -1 ? "invite for" : "with"} email ${
          user.email
        } has been updated.`,
        status: "success",
        isClosable: true,
        duration: 6000,
      });
    } catch (error) {
      toast({
        title: "Error while updating user role!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  async function delOrg() {
    try {
      await deleteOrg(orgId);

      toast({
        title: "Success!",
        description: `Organisation with id '${orgId}' has been deleted!`,
        status: "success",
        isClosable: true,
        duration: 6000,
      });

      navigateToDashboardPage();
    } catch (error) {
      toast({
        title: `Error while deleting org with id ${orgId}!`,
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  async function delOrgAdminToken() {
    try {
      await deleteOrgAdminToken(orgId, tokenIdToDelete);

      orgAdminTokenMutate();

      toast({
        title: "Success!",
        description: "Organisation admin token has been deleted!",
        status: "success",
        isClosable: true,
        duration: 6000,
      });
    } catch (error) {
      toast({
        title: `Error while deleting org admin token!`,
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  async function sendCreateCustomerPortalSession() {
    try {
      const data = await createCustomerPortalSession(orgId);
      window.location.assign(data);
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

  async function sendCreateNewToken() {
    try {
      await createOrgAdminToken(orgId, tokenLabel);

      orgAdminTokenMutate();
      setTokenLabel("");

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
          {userRole === "ADMIN" && (
            <div>
              <Heading className="text-center">Edit Organisation</Heading>
              <form className="mt-8" id="orgForm" onSubmit={submitHandler}>
                <FormControl className="mt-4">
                  <FormLabel>Name</FormLabel>
                  <Input
                    required
                    id="name"
                    value={orgName}
                    onChange={(event) => setOrgName(event.target.value)}
                  />
                </FormControl>
                <Center>
                  <Button colorScheme="blue" className="mt-4" type="submit">
                    update
                  </Button>
                </Center>
              </form>
            </div>
          )}

          <div className={styles.main}>
            <Heading className="text-center">Users</Heading>
            {userRole === "ADMIN" && (
              <div className="flex flex-row mt-8">
                <FormControl className="mt-4">
                  <FormLabel>Invitation link</FormLabel>
                  <Input
                    disabled
                    id="invite"
                    value={
                      baseUrl + "/dashboard?invite=" + org?.invitationToken
                    }
                  />
                </FormControl>
                <Stack>
                  <Button
                    colorScheme="blue"
                    className="ml-5 mt-5"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        baseUrl +
                          "/dashboard?invite=" +
                          (org?.invitationToken as string)
                      );
                      toast({
                        title: "Success!",
                        description: "Invitation link copied to clipboard.",
                        status: "success",
                        isClosable: true,
                        duration: 6000,
                      });
                    }}
                  >
                    copy
                  </Button>
                  <Button
                    colorScheme="blue"
                    className="ml-5 mt-1"
                    onClick={resetInvitation}
                  >
                    reset
                  </Button>
                </Stack>
              </div>
            )}
            {userRole === "ADMIN" && (
              <form
                className="mt-8 flex flex-row"
                id="emailForm"
                onSubmit={userInviteHandler}
              >
                <FormControl className="mt-4">
                  <FormLabel>Email</FormLabel>
                  <div className="flex flex-row">
                    <Input
                      required
                      id="email"
                      type="email"
                      value={userEmail}
                      onChange={(event) => setUserEmail(event.target.value)}
                    />
                    <Center>
                      <Button className="ml-4" colorScheme="blue" type="submit">
                        invite user
                      </Button>
                    </Center>
                  </div>
                </FormControl>
              </form>
            )}
            <Table
              className="mt-8"
              sx={{ minWidth: 650, maxWidth: 1000 }}
              aria-label="simple table"
            >
              <Thead>
                <Tr>
                  <Th></Th>
                  <Th>
                    <strong>Name</strong>
                  </Th>
                  <Th>
                    <strong>Email</strong>
                  </Th>
                  <Th>
                    <strong>Role</strong>
                  </Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {Array.isArray(users) &&
                  users.length > 0 &&
                  users?.map((user, index) => {
                    return (
                      <Tr key={index}>
                        <Td>
                          <Avatar
                            size={"sm"}
                            name={user.firstName + " " + user.lastName}
                          />
                        </Td>
                        <Td>{user.firstName + " " + user.lastName}</Td>
                        <Td>{user.email}</Td>
                        <Td>
                          {userRole === "ADMIN" && (
                            <div className="flex flex-row">
                              <Select
                                disabled={user.email === session?.user?.email}
                                value={user.role}
                                onChange={(event) =>
                                  handleRoleChange(index, event)
                                }
                              >
                                {roles.map((value, index) => {
                                  return (
                                    <option key={index} value={value}>
                                      {value}
                                    </option>
                                  );
                                })}
                              </Select>
                              <Tooltip
                                label={
                                  user.email === session?.user?.email
                                    ? "leave organisation"
                                    : "remove from organisation"
                                }
                              >
                                <IconButton
                                  colorScheme="red"
                                  className="ml-4"
                                  aria-label={"remove user"}
                                  onClick={() => removeUser(user.email)}
                                >
                                  <MdDeleteForever />
                                </IconButton>
                              </Tooltip>
                            </div>
                          )}
                          {userRole === "USER" && (
                            <div>
                              {(user.role as string).toLowerCase()}

                              {user.email === session?.user?.email && (
                                <Tooltip label="leave organisation">
                                  <IconButton
                                    colorScheme="red"
                                    className="ml-4"
                                    aria-label={"leave organisation"}
                                    onClick={() => removeUser(user.email)}
                                  >
                                    <MdDeleteForever />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </div>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
              </Tbody>
            </Table>
            {users?.length == 0 && <p className="mt-4">no data to show</p>}
            {userRole === "ADMIN" && (
              <>
                <Heading className="text-center mt-16 mb-8">
                  Admin Api Tokens
                </Heading>
                {!isOrgAdminTokenLoading && (
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
                            <strong>Label</strong>
                          </Th>
                          <Th>
                            <strong>Token</strong>
                          </Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {orgAdminTokens?.map((token, index) => {
                          return (
                            <Tr key={index}>
                              <Td>{token.id}</Td>
                              <Td>{token.label}</Td>
                              <Td>
                                <Input
                                  value={token.token}
                                  readOnly
                                  className="bg-gray-300"
                                />
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
                                    aria-label={
                                      "delete organisation admin token"
                                    }
                                    className="ml-4"
                                    onClick={() => {
                                      setTokenIdToDelete(token.id);
                                      setSubtextOfTokenToDelete(
                                        token.label
                                          ? `The token for '${token.label}'`
                                          : `The token '${token.token}'`
                                      );
                                      onTokenDeletionOpen();
                                    }}
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
                    {orgAdminTokens?.length == 0 && (
                      <Center className="my-4">
                        currently no active organisation admin tokens
                      </Center>
                    )}
                    {isOrgAdminTokenLoading && (
                      <div>
                        <Heading className="text-center">loading ...</Heading>
                        <Spinner />
                      </div>
                    )}

                    <Center>
                      <Input
                        placeholder="Token label"
                        className="mt-8 mr-4 max-w-96"
                        value={tokenLabel}
                        onChange={(event) => setTokenLabel(event.target.value)}
                      />
                      <Button
                        colorScheme="blue"
                        variant="solid"
                        className="mt-8"
                        onClick={sendCreateNewToken}
                      >
                        add token
                      </Button>
                    </Center>
                  </div>
                )}
                {stripeConfig.isEnabled && (
                  <>
                    <Heading className="text-center mt-16 mb-8">
                      Your subscription
                    </Heading>
                    {!loading && subs?.length != 0 && (
                      <div>
                        <Table
                          className="mt-8"
                          sx={{ minWidth: 650, maxWidth: 1000 }}
                          aria-label="simple table"
                        >
                          <Thead>
                            <Tr>
                              <Th>
                                <strong>Org Id</strong>
                              </Th>
                              <Th>
                                <strong>Organisation</strong>
                              </Th>
                              <Th>
                                <strong>Subscription</strong>
                              </Th>
                              <Th></Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {subs?.map((sub, index) => {
                              return (
                                <Tr key={index}>
                                  <Td>{sub.org.id}</Td>
                                  <Td>{sub.org.name}</Td>
                                  <Td>
                                    <Tag
                                      size={"md"}
                                      key={index}
                                      borderRadius="full"
                                      variant="solid"
                                      colorScheme={getColorLabel(sub?.subName)}
                                    >
                                      {translateSubName(sub.subName)}
                                    </Tag>
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>

                        <Center>
                          <Button
                            rightIcon={<FiExternalLink />}
                            colorScheme="blue"
                            variant="solid"
                            className="mt-4"
                            onClick={sendCreateCustomerPortalSession}
                          >
                            manage subscription
                          </Button>
                        </Center>
                        {loading && (
                          <div>
                            <Heading className="text-center">
                              loading ...
                            </Heading>
                            <Spinner />
                          </div>
                        )}
                      </div>
                    )}
                    {!loading && subs?.length == 0 && (
                      <Center className="my-4">
                        currently no active subscription
                      </Center>
                    )}
                    {!loading && subs?.length == 0 && (
                      <Center>
                        <Button
                          colorScheme="blue"
                          variant="solid"
                          className="mt-4"
                          onClick={navigateToUpgradePage}
                        >
                          get a subscription
                        </Button>
                      </Center>
                    )}
                    {!loading && subs?.length == 0 && isCustomer && (
                      <Center>
                        <Button
                          rightIcon={<FiExternalLink />}
                          colorScheme="blue"
                          variant="solid"
                          className="mt-4"
                          onClick={sendCreateCustomerPortalSession}
                        >
                          see previous invoices
                        </Button>
                      </Center>
                    )}
                  </>
                )}
                <div>
                  <Heading className="text-center mt-16">
                    Delete Organisation
                  </Heading>
                  <div className="flex justify-center">
                    <Button
                      className="mt-8"
                      colorScheme="red"
                      onClick={onOrgDeletionOpen}
                    >
                      delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <AlertDialog
            isOpen={isOrgDeletionOpen}
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelOrgDeletionRef}
            onClose={onOrgDeletionClose}
            isCentered
          >
            <AlertDialogOverlay />

            <AlertDialogContent>
              <AlertDialogHeader>{`Delete org with id '${orgId}?`}</AlertDialogHeader>
              <AlertDialogCloseButton />
              <AlertDialogBody>
                This cannot be undone and restoring the org is not possible.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelOrgDeletionRef} onClick={onOrgDeletionClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  ml={3}
                  onClick={() => {
                    delOrg();
                    onOrgDeletionClose();
                  }}
                >
                  Confirm
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog
            isOpen={isTokenDeletionOpen}
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelTokenDeletionRef}
            onClose={onTokenDeletionClose}
            isCentered
          >
            <AlertDialogOverlay />

            <AlertDialogContent>
              <AlertDialogHeader>{`Delete app token?`}</AlertDialogHeader>
              <AlertDialogCloseButton />
              <AlertDialogBody>
                {`${subtextOfTokenToDelete} will be deleted forever.`}
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button
                  ref={cancelTokenDeletionRef}
                  onClick={onTokenDeletionClose}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  ml={3}
                  onClick={() => {
                    delOrgAdminToken();
                    onTokenDeletionClose();
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
