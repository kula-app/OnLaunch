"use client";

import { deleteOrg } from "@/app/actions/delete-org";
import { updateOrg } from "@/app/actions/update-org";
import { ServerError } from "@/errors/server-error";
import { useAuthenticatedUserRole } from "@/hooks/use-authenticated-user-role";
import { useOrg } from "@/hooks/use-org";
import type { Org } from "@/models/org";
import { OrgRole } from "@/models/org-role";
import Routes from "@/routes/routes";
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AlertTitle,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
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
  const toast = useToast();

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
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Failed to fetch organization</AlertTitle>
            <AlertDescription>{orgError.message}</AlertDescription>
          </Alert>
        )}
        {authenticatedUserRoleError && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Failed to fetch user role</AlertTitle>
            <AlertDescription>
              {authenticatedUserRoleError.message}
            </AlertDescription>
          </Alert>
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
              toast({
                title: "Success!",
                description: "Organisation has been updated.",
                status: "success",
                isClosable: true,
                duration: 6000,
              });
            } catch (error) {
              toast({
                title: "Failed to update organisation!",
                description: `${error}`,
                status: "error",
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
                    <FormControl
                      color="white"
                      w={"full"}
                      isInvalid={isFieldInvalid}
                    >
                      <FormLabel htmlFor={field.name}>
                        Organization Name
                      </FormLabel>
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
                          <FormErrorMessage>{errorMessage}</FormErrorMessage>
                        )}
                      />
                    </FormControl>
                  );
                }}
              </Field>
              <Button
                colorScheme="brand"
                type="submit"
                isLoading={props.isSubmitting}
                isDisabled={isOrgLoading || !props.dirty}
                onClick={props.submitForm}
              >
                Update
              </Button>
            </VStack>
          )}
        </Formik>
        <Divider color={"gray.700"} my={4} />
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

            toast({
              title: "Success!",
              description: `Organisation with id '${orgId}' has been deleted!`,
              status: "success",
              isClosable: true,
              duration: 6000,
            });

            router.push(Routes.dashboard);
          } catch (error) {
            toast({
              title: `Error while deleting org with id ${orgId}!`,
              description: `${error}`,
              status: "error",
              isClosable: true,
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
    <AlertDialog
      isOpen={isOpen}
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelOrgDeletionRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>{`Are you sure?`}</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          Deleting an organization is irreversible and cannot be undone.
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelOrgDeletionRef} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            ml={3}
            onClick={() => {
              onSubmit();
              onClose();
            }}
          >
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
