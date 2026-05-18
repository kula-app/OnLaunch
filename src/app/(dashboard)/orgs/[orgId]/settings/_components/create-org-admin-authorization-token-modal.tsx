"use client";

import {
  Button,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  Field,
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Authorization Token</ModalHeader>
        <ModalCloseButton />
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
              <ModalBody>
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
                      <Field.Root w={"full"} invalid={isFieldInvalid} mt={4}>
                        <Field.Label htmlFor={field.name}>Token Label</Field.Label>
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
                            <Field.ErrorText>{errorMessage}</Field.ErrorText>
                          )}
                        />
                      </Field.Root>
                    );
                  }}
                </Field>
              </ModalBody>
              <ModalFooter>
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
              </ModalFooter>
            </>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
};
