"use client";

import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
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

export const CreateAdminAuthorizationTokenModal: React.FC<{
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
                      <FormControl w={"full"} isInvalid={isFieldInvalid} mt={4}>
                        <FormLabel htmlFor={field.name}>Token Label</FormLabel>
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
                            <FormErrorMessage>{errorMessage}</FormErrorMessage>
                          )}
                        />
                      </FormControl>
                    );
                  }}
                </Field>
              </ModalBody>
              <ModalFooter>
                <HStack>
                  <Spacer />
                  <Button variant="solid" colorScheme="gray" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="brand"
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
