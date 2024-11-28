"use client";

import { createOrgUserInvite } from "@/app/actions/create-org-user-invite";
import { deleteOrgUserInvitation } from "@/app/actions/delete-org-user-invitation";
import { removeUserFromOrg } from "@/app/actions/remove-user-from-org";
import { resetOrgInvitationToken } from "@/app/actions/reset-org-invitation-token";
import { updateUserInviteRoleInOrg } from "@/app/actions/update-user-invite-role-in-org";
import { updateUserRoleInOrg } from "@/app/actions/update-user-role-in-org";
import { SessionNotFoundError } from "@/errors/session-not-found-error";
import { useAuthenticatedUserRole } from "@/hooks/use-authenticated-user-role";
import { useOrg } from "@/hooks/use-org";
import { useOrgUserInvitations } from "@/hooks/use-org-user-invitations";
import { useOrgUsers } from "@/hooks/use-org-users";
import type { Org } from "@/models/org";
import { OrgRole } from "@/models/org-role";
import type { OrgUser } from "@/models/org-user";
import type { OrgUserInvitation } from "@/models/org-user-invitation";
import Routes from "@/routes/routes";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { ErrorMessage, Field, Formik, type FieldProps } from "formik";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import {
  FaArrowRotateRight,
  FaCopy,
  FaDoorOpen,
  FaPaperPlane,
  FaTrash,
} from "react-icons/fa6";
import * as Yup from "yup";

export const OrgSettingsUsers: React.FC<{
  orgId: Org["id"];
}> = ({ orgId }) => {
  const router = useRouter();
  const toast = useToast();

  const { data: session } = useSession();

  const { org, error: orgError } = useOrg({ orgId });
  const {
    users,
    error: userError,
    isLoading: isLoadingUsers,
    refresh: refreshUsers,
  } = useOrgUsers(orgId);
  const {
    invitations,
    error: invitationsError,
    isLoading: isLoadingInvitations,
    refresh: refreshInvitations,
  } = useOrgUserInvitations({ orgId });
  const {
    role: authenticatedUserRole,
    error: authenticatedUserRoleError,
    isLoading: isLoadingAuthenticatedUserRole,
    refresh: refreshAuthenticatedUserRole,
  } = useAuthenticatedUserRole({ orgId });

  const onChangeUserRole = useCallback(
    async (user: OrgUser, role: OrgRole) => {
      try {
        await updateUserRoleInOrg({
          orgId,
          userId: user.id,
          role,
        });
        refreshUsers();

        toast({
          title: "Success!",
          description: `Role for user '${user.firstName + " " + user.lastName}' has been changed.`,
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
    },
    [orgId, refreshUsers, toast],
  );
  const onChangeUserInvitationRole = useCallback(
    async (invitation: OrgUserInvitation, role: OrgRole) => {
      try {
        await updateUserInviteRoleInOrg({
          orgId,
          invitationId: invitation.id,
          role,
        });
        refreshInvitations();

        toast({
          title: "Success!",
          description: `Role for invitation with email ${invitation.email} has been changed.`,
          status: "success",
        });
      } catch (error) {
        toast({
          title: "Error while updating user role!",
          description: `${error}`,
          status: "error",
        });
      }
    },
    [orgId, refreshInvitations, toast],
  );
  const onRemoveUser = useCallback(
    async (userId: OrgUser["id"]) => {
      try {
        await removeUserFromOrg({
          orgId,
          userId,
        });
        refreshUsers();

        toast({
          title: "Success",
          description: "User has been removed from organisation!",
          status: "success",
        });
      } catch (error) {
        toast({
          title: "Error while removing user!",
          description: `${error}`,
          status: "error",
        });
      }
    },
    [orgId, refreshUsers, toast],
  );
  const onDeleteInvitation = useCallback(
    async (invitationId: OrgUserInvitation["id"]) => {
      try {
        await deleteOrgUserInvitation({
          orgId,
          invitationId,
        });
        refreshUsers();

        toast({
          title: "Success",
          description: "Invitation has been deleted!",
          status: "success",
        });
      } catch (error) {
        toast({
          title: "Error while deleting invitation!",
          description: `${error}`,
          status: "error",
        });
      }
    },
    [orgId, refreshUsers, toast],
  );
  const onLeaveOrg = useCallback(async () => {
    try {
      if (!session?.user.id) {
        throw new SessionNotFoundError();
      }

      await removeUserFromOrg({
        orgId,
        userId: session?.user.id,
      });
      router.push(Routes.dashboard);
    } catch (error) {
      toast({
        title: "Error while leaving organisation!",
        description: `${error}`,
        status: "error",
      });
    }
  }, [orgId, router, session?.user.id, toast]);

  return (
    <VStack direction={"column"} w={"full"} align={"start"} gap={8}>
      {(orgError || authenticatedUserRoleError) && (
        <Alert status={"error"} w={"full"}>
          <AlertIcon />
          <AlertTitle>Failed to load organisation!</AlertTitle>
          <AlertDescription>
            {(orgError ?? authenticatedUserRoleError)?.message}
          </AlertDescription>
        </Alert>
      )}
      <VStack spacing={4} align={"start"} w={"full"}>
        <HStack w={"full"} justify={"space-between"}>
          <Heading as={"h2"} size={"md"} color={"white"}>
            Users
          </Heading>
          <IconButton
            colorScheme="gray"
            aria-label={"Refresh"}
            icon={<FaArrowRotateRight />}
            onClick={() => {
              refreshUsers();
            }}
            size={"sm"}
            isLoading={isLoadingUsers}
            rounded={"full"}
          />
        </HStack>
        {userError && (
          <Alert status={"error"} w={"full"}>
            <AlertIcon />
            <AlertTitle>Failed to load users!</AlertTitle>
            <AlertDescription>{userError.message}</AlertDescription>
          </Alert>
        )}
        <TableContainer w={"full"}>
          <Table w={"full"} variant={"brand-on-card"}>
            <Thead>
              <Tr>
                <Th>{/* Initials */}</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>{/* Actions */}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users?.map((user, index) => {
                return (
                  <Tr key={index}>
                    <Td w={6}>
                      <Avatar
                        size={"sm"}
                        name={user.firstName + " " + user.lastName}
                      />
                    </Td>
                    <Td>{user.firstName + " " + user.lastName}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      {authenticatedUserRole === OrgRole.ADMIN && (
                        <Flex>
                          <Select
                            value={user.role}
                            onChange={(e) =>
                              onChangeUserRole(
                                user,
                                e.currentTarget.value as OrgRole,
                              )
                            }
                            disabled={user.id === session?.user?.id}
                            variant={"brand-on-card"}
                          >
                            {Object.values(OrgRole).map((value) => {
                              return (
                                <option key={value} value={value}>
                                  {value}
                                </option>
                              );
                            })}
                          </Select>
                        </Flex>
                      )}
                    </Td>
                    <Td>
                      <HStack w={"full"} justify={"end"}>
                        {user.id !== session?.user.id &&
                          authenticatedUserRole === OrgRole.ADMIN && (
                            <Tooltip label={"Remove User"}>
                              <IconButton
                                colorScheme="red"
                                className="ml-4"
                                aria-label={"Remove User"}
                                icon={<FaTrash />}
                                onClick={() => onRemoveUser(user.id)}
                                rounded={"full"}
                              />
                            </Tooltip>
                          )}
                        {user.id === session?.user.id && (
                          <Tooltip label="Leave Organisation">
                            <IconButton
                              colorScheme="red"
                              className="ml-4"
                              aria-label={"Leave Organisation"}
                              icon={<FaDoorOpen />}
                              onClick={() => onLeaveOrg()}
                              rounded={"full"}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>

      <VStack spacing={4} align={"start"} w={"full"}>
        <Heading as={"h2"} size={"md"} color={"white"}>
          Invite Users
        </Heading>
        {invitationsError && (
          <Alert status={"error"} w={"full"}>
            <AlertIcon />
            <AlertTitle>Failed to load invitations!</AlertTitle>
            <AlertDescription>{invitationsError.message}</AlertDescription>
          </Alert>
        )}
        {authenticatedUserRole === OrgRole.ADMIN && (
          <>
            <InviteUserForm
              orgId={orgId}
              onSubmitted={() => {
                refreshUsers();
                refreshInvitations();
              }}
            />
            {org?.invitationToken && (
              <InvitationLinkForm
                orgId={orgId}
                invitationToken={org.invitationToken}
              />
            )}
          </>
        )}
        <HStack w={"full"} justify={"space-between"}>
          <Heading as={"h3"} size={"sm"} color={"white"}>
            Pending Invitations
          </Heading>
          <IconButton
            colorScheme="gray"
            aria-label={"Refresh"}
            icon={<FaArrowRotateRight />}
            onClick={() => {
              refreshInvitations();
            }}
            size={"sm"}
            isLoading={isLoadingInvitations}
            rounded={"full"}
          />
        </HStack>
        {invitations && invitations.length == 0 && (
          <Alert status={"info"} w={"full"}>
            <AlertIcon />
            <AlertTitle>No pending invitations!</AlertTitle>
            <AlertDescription>
              You can invite users by entering their email address above or by
              sharing the invitation link.
            </AlertDescription>
          </Alert>
        )}
        {invitations && invitations.length > 0 && (
          <TableContainer w={"full"}>
            <Table w={"full"} variant={"brand-on-card"}>
              <Thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>{/* Actions */}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {invitations?.map((invitation, index) => {
                  return (
                    <Tr key={index}>
                      <Td>{invitation.email}</Td>
                      <Td>
                        <Select
                          value={invitation.role}
                          variant={"brand-on-card"}
                          onChange={(event) =>
                            onChangeUserInvitationRole(
                              invitation,
                              event.currentTarget.value as OrgRole,
                            )
                          }
                        >
                          {Object.values(OrgRole).map((value) => {
                            return (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            );
                          })}
                        </Select>
                      </Td>
                      <Td>
                        {authenticatedUserRole === OrgRole.ADMIN && (
                          <Tooltip label={"Delete Invitation"}>
                            <IconButton
                              colorScheme="red"
                              aria-label={"Delete Invitation"}
                              icon={<FaTrash />}
                              onClick={() => onDeleteInvitation(invitation.id)}
                            />
                          </Tooltip>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </VStack>
    </VStack>
  );
};

interface InviteUserFormValues {
  email: string;
}

const inviteUserFormSchema = Yup.object<InviteUserFormValues>().shape({
  email: Yup.string()
    .email("The email is not valid.")
    .required("The email is required."),
});

const InviteUserForm: React.FC<{
  orgId: Org["id"];
  onSubmitted: () => void;
}> = ({ orgId, onSubmitted }) => {
  const toast = useToast();

  const initialValues: InviteUserFormValues = {
    email: "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={inviteUserFormSchema}
      validateOnChange={true}
      onSubmit={async (values) => {
        try {
          await createOrgUserInvite({
            orgId,
            email: values.email,
          });

          toast({
            title: "Success!",
            description: "User has been invited.",
            status: "success",
            isClosable: true,
            duration: 6000,
          });

          onSubmitted();
        } catch (error) {
          toast({
            title: "Error while inviting new user!",
            description: `${error}`,
            status: "error",
            isClosable: true,
            duration: 6000,
          });
        }
      }}
    >
      {(props) => {
        return (
          <VStack direction={"column"} w={"full"} align={"end"}>
            <Field name={"email"}>
              {({ field, form }: FieldProps<string, InviteUserFormValues>) => {
                const isFieldInvalid =
                  !!form.errors?.email && !!form.touched?.email;

                return (
                  <FormControl
                    color="white"
                    w={"full"}
                    isInvalid={isFieldInvalid}
                  >
                    <FormLabel htmlFor={field.name}>
                      Invite user by email
                    </FormLabel>
                    <HStack>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder={"user@email.com"}
                        variant={"brand-on-card"}
                      />
                      <Button
                        colorScheme="brand"
                        type="submit"
                        isLoading={props.isSubmitting}
                        onClick={props.submitForm}
                        rounded={"full"}
                        leftIcon={
                          <Box pl={4}>
                            <FaPaperPlane />
                          </Box>
                        }
                      >
                        <Box pr={4}>Send Invitation</Box>
                      </Button>
                    </HStack>
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
          </VStack>
        );
      }}
    </Formik>
  );
};

const InvitationLinkForm: React.FC<{
  orgId: Org["id"];
  invitationToken: string;
}> = ({ orgId, invitationToken }) => {
  const toast = useToast();

  async function onResetInvitationToken() {
    try {
      await resetOrgInvitationToken({
        orgId,
      });

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

  const invitationUrl = Routes.invitationUrlWithToken(invitationToken);
  return (
    <VStack direction={"column"} w={"full"} align={"end"}>
      <FormControl color="white" w={"full"}>
        <FormLabel>Invitation Link</FormLabel>
        <HStack>
          <InputGroup variant={"brand-on-card"}>
            <Input id="invite" value={invitationUrl} readOnly fontSize={"sm"} />
            <InputRightElement>
              <IconButton
                colorScheme={"whiteAlpha"}
                aria-label="Copy invitation link"
                icon={<FaCopy />}
                roundedLeft={"none"}
                roundedRight={"full"}
                onClick={() => {
                  navigator.clipboard.writeText(invitationUrl);
                  toast({
                    title: "Success!",
                    description: "Invitation link copied to clipboard.",
                    status: "success",
                  });
                }}
              />
            </InputRightElement>
          </InputGroup>
          <Button
            colorScheme={"orange"}
            onClick={onResetInvitationToken}
            rounded={"full"}
          >
            <Text px={4}>Reset Link</Text>
          </Button>
        </HStack>
        <FormHelperText color={"gray.200"}>
          Share this link with users to invite them to the organisation.
        </FormHelperText>
      </FormControl>
    </VStack>
  );
};
