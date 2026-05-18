"use client";

import { updatePassword } from "@/app/actions/update-password";
import { ServerError } from "@/errors/server-error";
import { Box, Button, Card, Heading, Input, useToast, VStack, Field } from "@chakra-ui/react";
import {
  ErrorMessage,
  Field,
  Formik,
  type FieldProps,
  type FormikProps,
} from "formik";
import { useRef } from "react";
import * as Yup from "yup";

const changePasswordSchema = Yup.object({
  passwordOld: Yup.string().required("Please enter your current password"),
  password: Yup.string()
    .min(8, ({ min }) => `Password must be at least ${min} characters longs`)
    .required("Please enter a new password"),
  passwordConfirmation: Yup.string()
    .equals([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your new password"),
});
type ChangePasswordValues = Yup.InferType<typeof changePasswordSchema>;

export const ChangePasswordCard: React.FC = () => {
  const toast = useToast();

  const formRef = useRef<FormikProps<ChangePasswordValues>>(null);
  const initialValues: ChangePasswordValues = {
    passwordOld: "",
    password: "",
    passwordConfirmation: "",
  };

  return (
    <>
      <Box w={"full"}>
        <Heading size={"md"} as={"h2"} color={"white"} mb={4}>
          Change Password
        </Heading>
        <Card.Root p={4} w={"full"}>
          <Card.Body>
            <Formik
              innerRef={formRef}
              enableReinitialize
              initialValues={initialValues}
              validationSchema={changePasswordSchema}
              onSubmit={async (values) => {
                try {
                  const response = await updatePassword({
                    password: values.password,
                    passwordOld: values.passwordOld,
                  });
                  if (!response.success) {
                    throw new ServerError(
                      response.error.name,
                      response.error.message,
                    );
                  }

                  toast({
                    status: "success",
                    title: "Password changed!",
                  });
                } catch (error) {
                  toast({
                    status: "error",
                    title: "Failed to change password!",
                    description: (error as Error).message,
                  });
                }
              }}
            >
              {(props) => (
                <VStack w={"full"} gap={4} align={"end"}>
                  <Field name="passwordOld">
                    {({
                      field,
                      form,
                    }: FieldProps<string, ChangePasswordValues>) => {
                      const isFieldInvalid =
                        !!form.errors?.passwordOld &&
                        !!form.touched?.passwordOld;

                      return (
                        <Field.Root color="white" invalid={isFieldInvalid}>
                          <Field.Label htmlFor={field.name}>
                            Current password
                          </Field.Label>
                          <Input
                            {...field}
                            id={field.name}
                            type={"password"}
                            autoComplete={"current-password"}
                            w={"full"}
                            variant={"brand-on-card"}
                          />
                          <ErrorMessage
                            name={field.name}
                            render={(errorMessage) => (
                              <Field.ErrorText>
                                {errorMessage}
                              </Field.ErrorText>
                            )}
                          />
                        </Field.Root>
                      );
                    }}
                  </Field>

                  <Field name="password">
                    {({
                      field,
                      form,
                    }: FieldProps<string, ChangePasswordValues>) => {
                      const isFieldInvalid =
                        !!form.errors?.password && !!form.touched?.password;

                      return (
                        <Field.Root color="white" invalid={isFieldInvalid}>
                          <Field.Label htmlFor={field.name}>
                            New password
                          </Field.Label>
                          <Input
                            {...field}
                            id={field.name}
                            type={"password"}
                            autoComplete={"new-password"}
                            w={"full"}
                            variant={"brand-on-card"}
                          />{" "}
                          <ErrorMessage
                            name={field.name}
                            render={(errorMessage) => (
                              <Field.ErrorText>
                                {errorMessage}
                              </Field.ErrorText>
                            )}
                          />
                        </Field.Root>
                      );
                    }}
                  </Field>

                  <Field name="passwordConfirmation">
                    {({
                      field,
                      form,
                    }: FieldProps<string, ChangePasswordValues>) => {
                      const isFieldInvalid =
                        !!form.errors?.passwordConfirmation &&
                        !!form.touched?.passwordConfirmation;

                      return (
                        <Field.Root color="white" invalid={isFieldInvalid}>
                          <Field.Label htmlFor={field.name}>
                            Confirm new password
                          </Field.Label>
                          <Input
                            {...field}
                            id={field.name}
                            type={"password"}
                            autoComplete={"new-password"}
                            w={"full"}
                            variant={"brand-on-card"}
                          />{" "}
                          <ErrorMessage
                            name={field.name}
                            render={(errorMessage) => (
                              <Field.ErrorText>
                                {errorMessage}
                              </Field.ErrorText>
                            )}
                          />
                        </Field.Root>
                      );
                    }}
                  </Field>
                  <Button
                    colorPalette="brand"
                    type="submit"
                    loading={props.isSubmitting}
                    disabled={!props.dirty}
                    onClick={props.submitForm}
                  >
                    Update
                  </Button>
                </VStack>
              )}
            </Formik>
          </Card.Body>
        </Card.Root>
      </Box>
    </>
  );
};
