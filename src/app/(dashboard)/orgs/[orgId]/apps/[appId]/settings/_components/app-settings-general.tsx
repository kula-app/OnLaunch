"use client";

import { deleteApp } from "@/app/actions/delete-app";
import { updateApp } from "@/app/actions/update-app";
import { toaster } from "@/components/ui/toaster";
import { ServerError } from "@/errors/server-error";
import { useApp } from "@/hooks/use-app";
import { useAuthenticatedUserRole } from "@/hooks/use-authenticated-user-role";
import { App } from "@/models/app";
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
import {
  ErrorMessage,
  Field,
  Formik,
  type FieldProps,
  type FormikProps,
} from "formik";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { FaTrash } from "react-icons/fa6";
import * as Yup from "yup";

interface UpdateAppFormValues {
  name: string;
}

const updateAppSchema = Yup.object<UpdateAppFormValues>().shape({
  name: Yup.string().required("Please enter a name for your app."),
});

export const AppSettingsGeneral: React.FC<{
  orgId: Org["id"];
  appId: App["id"];
}> = ({ orgId, appId }) => {
  const router = useRouter();

  const { role, error: authenticatedUserRoleError } = useAuthenticatedUserRole({
    orgId,
  });
  const {
    app,
    isLoading: isAppLoading,
    error: appError,
    refresh: refreshApp,
  } = useApp({ appId });
  const initialValues: UpdateAppFormValues = {
    name: app?.name ?? "",
  };

  const formRef = useRef<FormikProps<UpdateAppFormValues>>(null);
  const {
    isOpen: isAppDeletionOpen,
    onOpen: onAppDeletionOpen,
    onClose: onAppDeletionClose,
  } = useDisclosure();

  return (
    <>
      <Flex direction={"column"} w={"full"} align={"start"}>
        {appError && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Failed to fetch app</Alert.Title>
            <Alert.Description>{appError.message}</Alert.Description>
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
          initialValues={initialValues}
          validationSchema={updateAppSchema}
          onSubmit={async (values) => {
            try {
              const result = await updateApp(appId, {
                name: values.name,
              });
              if (!result.success) {
                throw new ServerError(result.error.name, result.error.message);
              }
              refreshApp();

              toaster.create({
                title: "Success!",
                description: "App has been updated.",
                type: "success",
                closable: true,
                duration: 6000,
              });
            } catch (error) {
              toaster.create({
                title: "Failed to update app!",
                description: `${error}`,
                type: "error",
              });
            }
          }}
        >
          {(props) => (
            <VStack direction={"column"} w={"full"} align={"end"} maxW={"xl"}>
              <Field name="name">
                {({ field, form }: FieldProps<string, UpdateAppFormValues>) => {
                  const isFieldInvalid =
                    !!form.errors?.name && !!form.touched?.name;

                  return (
                    <ChakraField.Root
                      color="white"
                      w={"full"}
                      invalid={isFieldInvalid}
                    >
                      <ChakraField.Label htmlFor={field.name}>App Name</ChakraField.Label>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="e.g. My First App"
                        w={"full"}
                        variant={"brand-on-card"}
                        minH={"50px"}
                        isDisabled={isAppLoading}
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
                disabled={isAppLoading || !props.dirty}
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
            <Heading size="md">Delete App</Heading>
            <Text>Deleting an app is irreversible and cannot be undone.</Text>
          </VStack>
          <Tooltip
            label={
              role !== OrgRole.ADMIN
                ? "Only organization administrators can delete the app"
                : undefined
            }
          >
            <IconButton
              colorScheme="red"
              aria-label="Delete App"
              icon={<FaTrash />}
              onClick={onAppDeletionOpen}
              isDisabled={role !== OrgRole.ADMIN}
            />
          </Tooltip>
        </HStack>
      </Flex>
      <DeleteAppAlert
        isOpen={isAppDeletionOpen}
        onClose={onAppDeletionClose}
        onSubmit={async () => {
          try {
            const response = await deleteApp({ appId });
            if (!response.success) {
              throw new ServerError(
                response.error.name,
                response.error.message,
              );
            }

            toaster.create({
              title: "Success!",
              description: `App with id '${appId}' has been deleted!`,
              type: "success",
              closable: true,
              duration: 6000,
            });

            router.push(Routes.dashboard);
          } catch (error) {
            toaster.create({
              title: `Error while deleting app with id ${appId}!`,
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

export const DeleteAppAlert: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const cancelAppDeletionRef = useRef(null);

  return (
    <Dialog.Root
      open={isOpen}
      motionPreset="slideInBottom"
      initialFocusEl={() => cancelAppDeletionRef.current}
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
              Deleting an appanization is irreversible and cannot be undone.
            </Dialog.Body>
            <Dialog.Footer>
              <Button ref={cancelAppDeletionRef} onClick={onClose}>
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
