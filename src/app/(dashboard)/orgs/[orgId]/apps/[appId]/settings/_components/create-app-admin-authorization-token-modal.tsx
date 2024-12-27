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
import moment from "moment";
import React from "react";
import * as Yup from "yup";

interface CreateTokenFormValues {
  label: string;
  expiresIn: number | "unlimited" | "custom";
  customExpirationDate: Date;
}

const createTokenFormValuesSchema = Yup.object<CreateTokenFormValues>().shape({
  label: Yup.string().required("Please enter a label"),
  expiresIn: Yup.mixed()
    .test(
      "is-valid",
      "Please select an expiration time or enter a custom date",
      function (value) {
        if (value === "custom") {
          return this.parent.customExpirationDate !== undefined;
        }
        const parsedValue = parseInt(value as string, 10);
        return parsedValue >= 0;
      },
    )
    .required("Please select an expiration time")
    .default(0),
  customExpirationDate: Yup.date().when("expiresIn", {
    is: "custom",
    then: () =>
      Yup.date()
        .min(new Date(), "Please enter a date in the future")
        .required("Please enter a custom expiration date"),
    otherwise: () => Yup.date().notRequired(),
  }),
});

export const CreateAppAdminAuthorizationTokenModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (label: string, expirationDate: Date | undefined) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
  // Options for the dropdown
  const options: {
    label: string;
    value: number | "unlimited" | "custom";
  }[] = [
    {
      label: "1 day",
      value: 1 * 24 * 60 * 60 * 1000,
    },
    {
      label: "7 days",
      value: 7 * 24 * 60 * 60 * 1000,
    },
    {
      label: "30 days",
      value: 30 * 24 * 60 * 60 * 1000,
    },
    {
      label: "60 days",
      value: 60 * 24 * 60 * 60 * 1000,
    },
    {
      label: "90 days",
      value: 90 * 24 * 60 * 60 * 1000,
    },
    {
      label: "Custom...",
      value: "custom",
    },
    {
      label: "No expiration",
      value: "unlimited",
    },
  ];
  const initialValues: CreateTokenFormValues = {
    label: "",
    expiresIn: options[0].value, // Default to 1 day
    customExpirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
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
            const expirationDate =
              values.expiresIn === "unlimited"
                ? undefined
                : values.expiresIn === "custom"
                  ? values.customExpirationDate
                  : new Date(Date.now() + values.expiresIn);
            await onSubmit(values.label, expirationDate);
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
                <Field name={"expiresIn"}>
                  {({
                    field,
                    form,
                  }: FieldProps<number, CreateTokenFormValues>) => {
                    const isFieldInvalid =
                      !!form.errors?.expiresIn && !!form.touched?.expiresIn;

                    return (
                      <FormControl w={"full"} isInvalid={isFieldInvalid} mt={4}>
                        <FormLabel htmlFor={field.name}>Expires In</FormLabel>
                        <Input
                          {...field}
                          onChange={(e) => {
                            form.setFieldValue(
                              field.name,
                              parseInt(e.target.value, 10),
                            );
                          }}
                          id={field.name}
                          placeholder="Select an expiration time"
                          w={"full"}
                          as={"select"}
                        >
                          {options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Input>
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
                <Field name={"customExpirationDate"}>
                  {({
                    field,
                    form,
                  }: FieldProps<Date, CreateTokenFormValues>) => {
                    const isFieldInvalid =
                      !!form.errors?.customExpirationDate &&
                      !!form.touched?.customExpirationDate;

                    return (
                      <FormControl
                        w={"full"}
                        isInvalid={isFieldInvalid}
                        mt={4}
                        display={
                          form.values.expiresIn === "custom" ? "block" : "none"
                        }
                      >
                        <FormLabel htmlFor={field.name}>
                          Custom Expiration Date
                        </FormLabel>
                        <Input
                          {...field}
                          value={moment(field.value).format("YYYY-MM-DDTHH:mm")}
                          onChange={(e) => {
                            form.setFieldValue(
                              field.name,
                              new Date(e.target.value),
                            );
                          }}
                          id={field.name}
                          placeholder="Select a custom expiration date"
                          type={"datetime-local"}
                          min={moment().format("YYYY-MM-DDTHH:mm")}
                          w={"full"}
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
