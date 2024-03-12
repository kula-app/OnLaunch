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
import AppColors from "../../../styles/appColors";
import { getColorLabel, translateSubName } from "../../../util/nameTag";

export default function EditOrgPage() {
  const router = useRouter();
  const toast = useToast();
  const stripeConfig = loadConfig().client.stripeConfig;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

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

  if (userError || orgError) return <div>Failed to load</div>;

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

  function handleDelete() {
    onOpen();
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
                <Button
                  colorScheme="highlightPurple"
                  className="mt-4 w-full"
                  type="submit"
                >
                  update
                </Button>
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
                    colorScheme="highlightPurple"
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
                    colorScheme="highlightPurple"
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
                      <Button
                        className="ml-4"
                        colorScheme="highlightPurple"
                        type="submit"
                      >
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
                  <Th sx={{ borderColor: AppColors.tdBorderColor }}></Th>
                  <Th sx={{ borderColor: AppColors.tdBorderColor }}>
                    <strong>Name</strong>
                  </Th>
                  <Th sx={{ borderColor: AppColors.tdBorderColor }}>
                    <strong>Email</strong>
                  </Th>
                  <Th sx={{ borderColor: AppColors.tdBorderColor }}>
                    <strong>Role</strong>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {Array.isArray(users) &&
                  users.length > 0 &&
                  users?.map((user, index) => {
                    return (
                      <Tr key={index}>
                        <Td sx={{ borderColor: AppColors.tdBorderColor }}>
                          <Avatar
                            size={"sm"}
                            name={user.firstName + " " + user.lastName}
                          />
                        </Td>
                        <Td sx={{ borderColor: AppColors.tdBorderColor }}>
                          {user.firstName + " " + user.lastName}
                        </Td>
                        <Td sx={{ borderColor: AppColors.tdBorderColor }}>
                          {user.email}
                        </Td>
                        <Td sx={{ borderColor: AppColors.tdBorderColor }}>
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
                                  className="ml-4"
                                  aria-label={"remove user"}
                                  onClick={() => removeUser(user.email)}
                                  icon={<MdDeleteForever />}
                                  colorScheme="red"
                                  color="white"
                                  variant="solid"
                                />
                              </Tooltip>
                            </div>
                          )}
                          {userRole === "USER" && (
                            <div>
                              {(user.role as string).toLowerCase()}

                              {user.email === session?.user?.email && (
                                <Tooltip label="leave organisation">
                                  <IconButton
                                    className="ml-4"
                                    aria-label={"leave organisation"}
                                    onClick={() => removeUser(user.email)}
                                    icon={<MdDeleteForever />}
                                    colorScheme="red"
                                    color="white"
                                    variant="solid"
                                  />
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
                              <Th sx={{ borderColor: AppColors.tdBorderColor }}>
                                <strong>Org Id</strong>
                              </Th>
                              <Th sx={{ borderColor: AppColors.tdBorderColor }}>
                                <strong>Organisation</strong>
                              </Th>
                              <Th sx={{ borderColor: AppColors.tdBorderColor }}>
                                <strong>Subscription</strong>
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {subs?.map((sub, index) => {
                              return (
                                <Tr key={index}>
                                  <Td
                                    sx={{
                                      borderColor: AppColors.tdBorderColor,
                                    }}
                                  >
                                    {sub.org.id}
                                  </Td>
                                  <Td
                                    sx={{
                                      borderColor: AppColors.tdBorderColor,
                                    }}
                                  >
                                    {sub.org.name}
                                  </Td>
                                  <Td
                                    sx={{
                                      borderColor: AppColors.tdBorderColor,
                                    }}
                                  >
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
                            colorScheme="highlightPurple"
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
                          colorScheme="highlightPurple"
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
                          colorScheme="highlightPurple"
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
                      onClick={handleDelete}
                    >
                      delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <AlertDialog
            isOpen={isOpen}
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isCentered
          >
            <AlertDialogOverlay />

            <AlertDialogContent>
              <AlertDialogHeader>{`Delete Organisation '${org?.name}?`}</AlertDialogHeader>
              <AlertDialogCloseButton />
              <AlertDialogBody>This cannot be undone.</AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  ml={3}
                  onClick={() => {
                    delOrg();
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
