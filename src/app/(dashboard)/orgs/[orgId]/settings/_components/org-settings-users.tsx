"use client";

import { createOrgUserInvite } from "@/app/actions/create-org-user-invite";
import { deleteOrgUserInvitation } from "@/app/actions/delete-org-user-invitation";
import { removeUserFromOrg } from "@/app/actions/remove-user-from-org";
import { resetOrgInvitationToken } from "@/app/actions/reset-org-invitation-token";
import { updateUserInviteRoleInOrg } from "@/app/actions/update-user-invite-role-in-org";
import { updateUserRoleInOrg } from "@/app/actions/update-user-role-in-org";
import { loadClientConfig } from "@/config/loadClientConfig";
import { SessionNotFoundError } from "@/errors/session-not-found-error";
import { useAuthenticatedUserRole } from "@/hooks/use-authenticated-user-role";
import { useOrg } from "@/hooks/use-org";
import { useOrgUserInvitations } from "@/hooks/use-org-user-invitations";
import { useOrgUsers } from "@/hooks/use-org-users";
import type { Org } from "@/models/org";
import { OrgRole } from "@/models/org-role";
import type { OrgUser } from "@/models/org-user";
import type { OrgUserInvitation } from "@/models/org-user-invitation";
import { Routes } from "@/routes/routes";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Table,
  Text,
  Tooltip,
  VStack,
  Field as ChakraField,
} from "@chakra-ui/react";
import { BrandSelect } from "@/components/ui/brand-select";
import { toaster } from "@/components/ui/toaster";
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

        toaster.create({
          title: "Success!",
          description: `Role for user '${user.firstName + " " + user.lastName}' has been changed.`,
          type: "success",
          closable: true,
          duration: 6000,
        });
      } catch (error) {
        toaster.create({
          title: "Error while updating user role!",
          description: `${error}`,
          type: "error",
          closable: true,
          duration: 6000,
        });
      }
    },
    [orgId, refreshUsers],
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

        toaster.create({
          title: "Success!",
          description: `Role for invitation with email ${invitation.email} has been changed.`,
          type: "success",
        });
      } catch (error) {
        toaster.create({
          title: "Error while updating user role!",
          description: `${error}`,
          type: "error",
        });
      }
    },
    [orgId, refreshInvitations],
  );
  const onRemoveUser = useCallback(
    async (userId: OrgUser["id"]) => {
      try {
        await removeUserFromOrg({
          orgId,
          userId,
        });
        refreshUsers();

        toaster.create({
          title: "Success",
          description: "User has been removed from organisation!",
          type: "success",
        });
      } catch (error) {
        toaster.create({
          title: "Error while removing user!",
          description: `${error}`,
          type: "error",
        });
      }
    },
    [orgId, refreshUsers],
  );
  const onDeleteInvitation = useCallback(
    async (invitationId: OrgUserInvitation["id"]) => {
      try {
        await deleteOrgUserInvitation({
          orgId,
          invitationId,
        });
        refreshUsers();

        toaster.create({
          title: "Success",
          description: "Invitation has been deleted!",
          type: "success",
        });
      } catch (error) {
        toaster.create({
          title: "Error while deleting invitation!",
          description: `${error}`,
          type: "error",
        });
      }
    },
    [orgId, refreshUsers],
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
      toaster.create({
        title: "Error while leaving organisation!",
        description: `${error}`,
        type: "error",
      });
    }
  }, [orgId, router, session?.user.id]);

  return (
    <VStack direction={"column"} w={"full"} align={"start"} gap={8}>
      {(orgError || authenticatedUserRoleError) && (
        <Alert.Root status={"error"} w={"full"}>
          <Alert.Indicator />
          <Alert.Title>Failed to load organisation!</Alert.Title>
          <Alert.Description>
            {(orgError ?? authenticatedUserRoleError)?.message}
          </Alert.Description>
        </Alert.Root>
      )}
      <VStack gap={4} align={"start"} w={"full"}>
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
          <Alert.Root status={"error"} w={"full"}>
            <Alert.Indicator />
            <Alert.Title>Failed to load users!</Alert.Title>
            <Alert.Description>{userError.message}</Alert.Description>
          </Alert.Root>
        )}
        <Table.ScrollArea w={"full"}>
          <Table.Root w={"full"} variant={"brand-on-card"}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{/* Initials */}</Table.ColumnHeader>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Email</Table.ColumnHeader>
                <Table.ColumnHeader>Role</Table.ColumnHeader>
                <Table.ColumnHeader>{/* Actions */}</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {users?.map((user, index) => {
                return (
                  <Table.Row key={index}>
                    <Table.Cell w={6}>
                      <Avatar.Root size={"sm"}><Avatar.Fallback name={user.firstName + " " + user.lastName} /></Avatar.Root>
                    </Table.Cell>
                    <Table.Cell>{user.firstName + " " + user.lastName}</Table.Cell>
                    <Table.Cell>{user.email}</Table.Cell>
                    <Table.Cell>
                      {authenticatedUserRole === OrgRole.ADMIN && (
                        <Flex>
                          <BrandSelect
                            value={user.role}
                            onChange={(e) =>
                              onChangeUserRole(
                                user,
                                e.currentTarget.value as OrgRole,
                              )
                            }
                            disabled={user.id === session?.user?.id}
                          >
                            {Object.values(OrgRole).map((value) => {
                              return (
                                <option key={value} value={value}>
                                  {value}
                                </option>
                              );
                            })}
                          </BrandSelect>
                        </Flex>
                      )}
                    </Table.Cell>
                    <Table.Cell>
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
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </VStack>
      <VStack gap={4} align={"start"} w={"full"}>
        <Heading as={"h2"} size={"md"} color={"white"}>
          Invite Users
        </Heading>
        {invitationsError && (
          <Alert.Root status={"error"} w={"full"}>
            <Alert.Indicator />
            <Alert.Title>Failed to load invitations!</Alert.Title>
            <Alert.Description>{invitationsError.message}</Alert.Description>
          </Alert.Root>
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
          <Alert.Root status={"info"} w={"full"}>
            <Alert.Indicator />
            <Alert.Title>No pending invitations!</Alert.Title>
            <Alert.Description>
              You can invite users by entering their email address above or by
              sharing the invitation link.
            </Alert.Description>
          </Alert.Root>
        )}
        {invitations && invitations.length > 0 && (
          <Table.ScrollArea w={"full"}>
            <Table.Root w={"full"} variant={"brand-on-card"}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Email</Table.ColumnHeader>
                  <Table.ColumnHeader>Role</Table.ColumnHeader>
                  <Table.ColumnHeader>{/* Actions */}</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {invitations?.map((invitation, index) => {
                  return (
                    <Table.Row key={index}>
                      <Table.Cell>{invitation.email}</Table.Cell>
                      <Table.Cell>
                        <BrandSelect
                          value={invitation.role}
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
                        </BrandSelect>
                      </Table.Cell>
                      <Table.Cell>
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
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
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

          toaster.create({
            title: "Success!",
            description: "User has been invited.",
            type: "success",
            closable: true,
            duration: 6000,
          });

          onSubmitted();
        } catch (error) {
          toaster.create({
            title: "Error while inviting new user!",
            description: `${error}`,
            type: "error",
            closable: true,
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
                  <ChakraField.Root
                    color="white"
                    w={"full"}
                    invalid={isFieldInvalid}
                  >
                    <ChakraField.Label>
                      Invite user by email
                    </ChakraField.Label>
                    <HStack>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder={"user@email.com"}
                        variant={"brand-on-card"}
                      />
                      <Button
                        colorPalette="brand"
                        type="submit"
                        loading={props.isSubmitting}
                        onClick={props.submitForm}
                        rounded={"full"}><Box pl={4}>
                          <FaPaperPlane />
                        </Box><Box pr={4}>Send Invitation</Box></Button>
                    </HStack>
                    <ErrorMessage
                      name={field.name}
                      render={(errorMessage) => (
                        <ChakraField.ErrorText>{errorMessage}</ChakraField.ErrorText>
                      )}
                    />
                  </ChakraField.Root>
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
  const config = loadClientConfig();

  async function onResetInvitationToken() {
    try {
      await resetOrgInvitationToken({
        orgId,
      });

      toaster.create({
        title: "Success!",
        description: "Invitation link has been changed.",
        type: "success",
        closable: true,
        duration: 6000,
      });
    } catch (error) {
      toaster.create({
        title: "Error while changing invitation link!",
        description: `${error}`,
        type: "error",
        closable: true,
        duration: 6000,
      });
    }
  }

  const invitationUrl = Routes.getOrganizationInvitationUrl({
    baseUrl: config.baseConfig.url,
    token: invitationToken,
  });
  return (
    <VStack direction={"column"} w={"full"} align={"end"}>
      <ChakraField.Root color="white" w={"full"}>
        <ChakraField.Label>Invitation Link</ChakraField.Label>
        <HStack>
          <InputGroup
            variant={"brand-on-card"}
            endElement={
              <IconButton
                colorScheme={"whiteAlpha"}
                aria-label="Copy invitation link"
                icon={<FaCopy />}
                roundedLeft={"none"}
                roundedRight={"full"}
                onClick={() => {
                  navigator.clipboard.writeText(invitationUrl);
                  toaster.create({
                    title: "Success!",
                    description: "Invitation link copied to clipboard.",
                    type: "success",
                  });
                }}
              />
            }
          >
            <Input id="invite" value={invitationUrl} readOnly fontSize={"sm"} />
          </InputGroup>
          <Button
            colorPalette={"orange"}
            onClick={onResetInvitationToken}
            rounded={"full"}
          >
            <Text px={4}>Reset Link</Text>
          </Button>
        </HStack>
        <ChakraField.HelperText color={"gray.200"}>
          Share this link with users to invite them to the organisation.
        </ChakraField.HelperText>
      </ChakraField.Root>
    </VStack>
  );
};
