"use client";

import {
  Button,
  HStack,
  Input,
  Dialog,
  Portal,
  Spacer,
  Text,
  Field as ChakraField,
} from "@chakra-ui/react";
import { ErrorMessage, Field, Formik, type FieldProps } from "formik";
import React from "react";
import * as Yup from "yup";

interface CreateTokenFormValues {
  label: string;
}

const createTokenFormValuesSchema = Yup.object().shape({
  label: Yup.string().required("Label is required"),
});

export const CreateOrgAdminAuthorizationTokenModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (label: string) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
  const initialValues: CreateTokenFormValues = {
    label: "",
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger />
            <Dialog.Header>Create Authorization Token</Dialog.Header>
            <Formik
              initialValues={initialValues}
              validationSchema={createTokenFormValuesSchema}
              onSubmit={async (values) => {
                await onSubmit(values.label);
                onClose();
              }}
            >
              {(props) => (
                <>
                  <Dialog.Body>
                    <Text>
                      Define a label for the token, so you can identify it later.
                    </Text>
                    <Field name="label">
                      {({
                        field,
                        form,
                      }: FieldProps<string, CreateTokenFormValues>) => {
                        const isFieldInvalid =
                          !!form.errors?.label && !!form.touched?.label;

                        return (
                          <ChakraField.Root w={"full"} invalid={isFieldInvalid} mt={4}>
                            <ChakraField.Label htmlFor={field.name}>Token Label</ChakraField.Label>
                            <Input
                              {...field}
                              id={field.name}
                              placeholder="New Token"
                              w={"full"}
                              minH={"50px"}
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
                  </Dialog.Body>
                  <Dialog.Footer>
                    <HStack>
                      <Spacer />
                      <Button variant="solid" colorPalette="gray" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        variant="solid"
                        colorPalette="brand"
                        onClick={props.submitForm}
                      >
                        Create
                      </Button>
                    </HStack>
                  </Dialog.Footer>
                </>
              )}
            </Formik>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
