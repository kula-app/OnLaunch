"use client";

import { deleteOrg } from "@/app/actions/delete-org";
import { updateOrg } from "@/app/actions/update-org";
import { ServerError } from "@/errors/server-error";
import { useAuthenticatedUserRole } from "@/hooks/use-authenticated-user-role";
import { useOrg } from "@/hooks/use-org";
import type { Org } from "@/models/org";
import { OrgRole } from "@/models/org-role";
import { Routes } from "@/routes/routes";
import {
  Alert,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Text,
  Tooltip,
  useDisclosure,
  VStack,
  Dialog,
  Portal,
  Separator,
  Field as ChakraField,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  ErrorMessage,
  Field,
  Formik,
  FormikProps,
  type FieldProps,
} from "formik";
import { useRouter } from "next/navigation";
import type React from "react";
import { useRef } from "react";
import { FaTrash } from "react-icons/fa6";
import * as Yup from "yup";

interface UpdateOrgFormValues {
  name: string;
}

const updateOrgSchema = Yup.object<UpdateOrgFormValues>().shape({
  name: Yup.string().required("Please enter a name for your organization."),
});

export const OrgSettingsGeneral: React.FC<{
  orgId: Org["id"];
}> = ({ orgId }) => {
  const router = useRouter();

  const { role, error: authenticatedUserRoleError } = useAuthenticatedUserRole({
    orgId,
  });
  const {
    org,
    isLoading: isOrgLoading,
    error: orgError,
    refresh: refreshOrg,
  } = useOrg({ orgId });

  const formRef = useRef<FormikProps<UpdateOrgFormValues>>(null);

  const {
    isOpen: isOrgDeletionOpen,
    onOpen: onOrgDeletionOpen,
    onClose: onOrgDeletionClose,
  } = useDisclosure();

  return (
    <>
      <Flex direction={"column"} w={"full"} align={"start"}>
        {orgError && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Failed to fetch organization</Alert.Title>
            <Alert.Description>{orgError.message}</Alert.Description>
          </Alert.Root>
        )}
        {authenticatedUserRoleError && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Failed to fetch user role</Alert.Title>
            <Alert.Description>
              {authenticatedUserRoleError.message}
            </Alert.Description>
          </Alert.Root>
        )}
        <Formik
          innerRef={formRef}
          enableReinitialize
          initialValues={{
            name: org?.name ?? "",
          }}
          validationSchema={updateOrgSchema}
          onSubmit={async (values) => {
            try {
              const result = await updateOrg(orgId, {
                name: values.name,
              });
              if (!result.success) {
                throw new ServerError(result.error.name, result.error.message);
              }
              refreshOrg();
              toaster.create({
                title: "Success!",
                description: "Organisation has been updated.",
                type: "success",
                closable: true,
                duration: 6000,
              });
            } catch (error) {
              toaster.create({
                title: "Failed to update organisation!",
                description: `${error}`,
                type: "error",
              });
            }
          }}
        >
          {(props) => (
            <VStack direction={"column"} w={"full"} align={"end"} maxW={"xl"}>
              <Field name="name">
                {({ field, form }: FieldProps<string, UpdateOrgFormValues>) => {
                  const isFieldInvalid =
                    !!form.errors?.name && !!form.touched?.name;

                  return (
                    <ChakraField.Root
                      color="white"
                      w={"full"}
                      invalid={isFieldInvalid}
                    >
                      <ChakraField.Label htmlFor={field.name}>
                        Organization Name
                      </ChakraField.Label>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="e.g. kula app GmbH"
                        w={"full"}
                        variant={"brand-on-card"}
                        minH={"50px"}
                        isDisabled={isOrgLoading}
                        readOnly={role !== OrgRole.ADMIN}
                      />
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
              <Button
                colorPalette="brand"
                type="submit"
                loading={props.isSubmitting}
                disabled={isOrgLoading || !props.dirty}
                onClick={props.submitForm}
              >
                Update
              </Button>
            </VStack>
          )}
        </Formik>
        <Separator color={"gray.700"} my={4} />
        <HStack w={"full"} maxW={"xl"}>
          <VStack w={"full"} align={"start"} color={"white"}>
            <Heading size="md">Delete Organization</Heading>
            <Text>
              Deleting an organization is irreversible and cannot be undone.
              <br />
              This will also affect apps of this organization using OnLaunch.
            </Text>
          </VStack>
          <Tooltip
            label={
              role !== OrgRole.ADMIN
                ? "Only administrators can delete the organization"
                : undefined
            }
          >
            <IconButton
              colorScheme="red"
              aria-label="Delete Organization"
              icon={<FaTrash />}
              onClick={onOrgDeletionOpen}
              isDisabled={role !== OrgRole.ADMIN}
            />
          </Tooltip>
        </HStack>
      </Flex>
      <DeleteOrgAlert
        isOpen={isOrgDeletionOpen}
        onClose={onOrgDeletionClose}
        onSubmit={async () => {
          try {
            const response = await deleteOrg(orgId);
            if (!response.success) {
              throw new ServerError(
                response.error.name,
                response.error.message,
              );
            }

            toaster.create({
              title: "Success!",
              description: `Organisation has been deleted!`,
              type: "success",
              closable: true,
              duration: 6000,
            });

            router.push(Routes.dashboard);
          } catch (error) {
            toaster.create({
              title: `Error while deleting organisation!`,
              description: `${error}`,
              type: "error",
              closable: true,
              duration: 6000,
            });
          }
        }}
      />
    </>
  );
};

export const DeleteOrgAlert: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const cancelOrgDeletionRef = useRef(null);

  return (
    <Dialog.Root
      open={isOpen}
      motionPreset="slideInBottom"
      initialFocusEl={() => cancelOrgDeletionRef.current}
      placement='center'
      role='alertdialog'
      onOpenChange={e => {
        if (!e.open) {
          onClose();
        }
      }}>
      <Portal>

        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>{`Are you sure?`}</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              Deleting an organization is irreversible and cannot be undone.
            </Dialog.Body>
            <Dialog.Footer>
              <Button ref={cancelOrgDeletionRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorPalette="red"
                ml={3}
                onClick={() => {
                  onSubmit();
                  onClose();
                }}
              >
                Confirm
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
  );
};
