import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import styles from "../../../styles/Home.module.css";
import { getSession, useSession } from "next-auth/react";
import getOrg from "../../../api/orgs/getOrg";
import updateOrg from "../../../api/orgs/updateOrg";
import Routes from "../../../routes/routes";
import { Org } from "../../../models/org";
import { MdDeleteForever } from "react-icons/md";
import updateUserRoleInOrg from "../../../api/orgs/updateUserRoleInOrg";
import { useUsers } from "../../../api/orgs/useUsers";
import deleteUserFromOrg from "../../../api/orgs/deleteUserFromOrg";
import inviteUser from "../../../api/orgs/inviteUser";
import resetOrgInvitationToken from "../../../api/tokens/resetOrgInvitationToken";
import { useOrg } from "../../../api/orgs/useOrg";
import deleteOrg from "../../../api/orgs/deleteOrg";
import updateUserInviteRoleInOrg from "../../../api/orgs/updateUserInviteRoleInOrg";
import {
  Input,
  useToast,
  Button,
  Table,
  Tooltip,
  IconButton,
  Select,
  Th,
  Thead,
  Tbody,
  Tr,
  Td,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import React from "react";

export default function EditOrgPage() {
  const router = useRouter();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const orgId = Number(router.query.orgId);

  const [orgName, setOrgName] = useState("");

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
  }, [router.isReady, orgId, toast]);

  const { data: session } = useSession();

  const { org, isError: orgError } = useOrg(orgId);
  const { users, isError: userError, mutate: userMutate } = useUsers(orgId);

  if (userError || orgError) return <div>Failed to load</div>;

  let userRole = "";
  if (!!users) {
    userRole = users.find((i) => i.email === session?.user?.email)
      ?.role as string;
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
        status: "error",
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
        } is now ${event.target.value}.`,
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

  return (
    <>
      <div>
        <main className={styles.main}>
          {userRole === "ADMIN" && (
            <div>
              <h1 className="text-3xl font-bold text-center">
                Edit Organisation
              </h1>
              <form className="mt-8" id="orgForm" onSubmit={submitHandler}>
                <label>
                  <Text as="b">Name</Text>
                  <Input
                    className="mt-2"
                    required
                    id="name"
                    value={orgName}
                    onChange={(event) => setOrgName(event.target.value)}
                  />
                </label>
                <div className="flex justify-center">
                  <Button colorScheme="blue" className="mt-4" type="submit">
                    update
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className={styles.main}>
            <h1 className="text-3xl font-bold text-center">Users</h1>
            {userRole === "ADMIN" && (
              <div className="flex flex-row mt-8">
                <label>
                  <Text as="b">Invitation Link</Text>
                  <Input
                    className="mt-2"
                    disabled
                    id="invite"
                    value={
                      baseUrl + "/dashboard?invite=" + org?.invitationToken
                    }
                  />
                </label>
                <div className="flex flex-col">
                  <Button
                    colorScheme="blue"
                    sx={{ marginLeft: 5 }}
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
                    sx={{ marginLeft: 5, marginTop: 1 }}
                    onClick={() => {
                      resetInvitation();
                    }}
                  >
                    reset
                  </Button>
                </div>
              </div>
            )}
            {userRole === "ADMIN" && (
              <form
                className="mt-8 flex flex-row"
                id="emailForm"
                onSubmit={userInviteHandler}
              >
                <label>
                  <Text as="b">Email</Text>
                  <div className="flex flex-row">
                    <Input
                      className="mt-2"
                      required
                      id="email"
                      value={userEmail}
                      onChange={(event) => setUserEmail(event.target.value)}
                    />
                    <Button className="mt-2 ml-4" colorScheme="blue" type="submit">
                      Invite User
                    </Button>
                  </div>
                </label>
              </form>
            )}
            <Table
              className="mt-8"
              sx={{ minWidth: 650, maxWidth: 1000 }}
              aria-label="simple table"
            >
              <Thead>
                <Tr>
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
                {users?.map((user, index) => {
                  return (
                    <Tr key={index}>
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
              <div>
                <h1 className="text-3xl font-bold text-center mt-16">
                  Delete Organisation
                </h1>
                <div className="flex justify-center">
                  <Button
                    className="mt-8"
                    colorScheme="red"
                    onClick={() => handleDelete()}
                  >
                    delete
                  </Button>
                </div>
              </div>
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
