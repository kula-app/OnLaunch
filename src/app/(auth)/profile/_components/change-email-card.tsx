"use client";

import { createEmailChangeToken } from "@/app/actions/create-email-change-token";
import { resendEmailConfirmationToken } from "@/app/actions/resend-email-confirmation-token";
import { ServerError } from "@/errors/server-error";
import { useCooldown } from "@/hooks/useCooldown";
import type { User } from "@/models/user";
import {
  Alert,
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  Field as ChakraField,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  ErrorMessage,
  Field,
  Formik,
  type FieldProps,
  type FormikProps,
} from "formik";
import { useCallback, useRef, useState } from "react";
import * as Yup from "yup";

const changeEmailSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Please enter a valid email address"),
});
type ChangeEmailValues = Yup.InferType<typeof changeEmailSchema>;

export const ChangeEmailCard: React.FC<{
  user: User | null;
  refreshUser: () => void;
}> = ({ user, refreshUser }) => {
  const formRef = useRef<FormikProps<ChangeEmailValues>>(null);
  const initialValues: ChangeEmailValues = {
    email: user?.email ?? "",
  };

  const [isResending, setIsResending] = useState(false);
  const resendCooldown = useCooldown(60);

  const onSubmitEmailChange = useCallback(
    async (values: ChangeEmailValues) => {
      try {
        const response = await createEmailChangeToken({
          email: values.email,
        });
        if (!response.success) {
          throw new ServerError(response.error.name, response.error.message);
        }
        refreshUser();

        toaster.create({
          title: "Success!",
          description: "Please check your mails.",
          type: "success",
        });
      } catch (error) {
        toaster.create({
          title: "Error while sending request!",
          description: `${error}`,
          type: "error",
        });
      }
    },
    [refreshUser],
  );
  const onSubmitResend = useCallback(async () => {
    setIsResending(true);
    resendCooldown.start();
    try {
      const response = await resendEmailConfirmationToken();
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }

      toaster.create({
        title: "Success!",
        description: "Please check your mails.",
        type: "success",
      });
    } catch (error) {
      toaster.create({
        title: "Failed to send email!",
        description: `${error}`,
        type: "error",
      });
    } finally {
      setIsResending(false);
    }
  }, [resendCooldown]);

  return (
    <Box w={"full"}>
      <Heading size={"md"} as={"h2"} color={"white"} mb={4}>
        Change Email
      </Heading>
      <Card.Root p={4} w={"full"}>
        <Card.Body>
          <Formik
            innerRef={formRef}
            enableReinitialize
            initialValues={initialValues}
            validationSchema={changeEmailSchema}
            onSubmit={onSubmitEmailChange}
          >
            {(props) => (
              <VStack w={"full"} gap={4} align={"end"}>
                <Field name="email">
                  {({ field, form }: FieldProps<string, ChangeEmailValues>) => {
                    const isFieldInvalid =
                      !!form.errors?.email && !!form.touched?.email;

                    return (
                      <ChakraField.Root
                        color="white"
                        w={"full"}
                        invalid={isFieldInvalid}
                      >
                        <ChakraField.Label htmlFor={field.name}>Email</ChakraField.Label>
                        <Input
                          {...field}
                          id={field.name}
                          placeholder="name@email.com"
                          w={"full"}
                          variant={"brand-on-card"}
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
                  disabled={!props.dirty}
                  onClick={props.submitForm}
                >
                  Update
                </Button>
                {user?.unconfirmedEmail && (
                  <Alert.Root status="warning" w={"full"} mt={4}>
                    <Alert.Indicator />
                    <Alert.Description w={"full"}>
                      <HStack w={"full"} justify={"space-between"}>
                        <Text>
                          Please verify your new email address by clicking the
                          link we sent to{" "}
                          <strong>{user.unconfirmedEmail}</strong>
                        </Text>
                        <Button
                          colorPalette="orange"
                          size="sm"
                          variant={"outline"}
                          loading={isResending}
                          disabled={resendCooldown.isActive}
                          onClick={onSubmitResend}
                        >
                          Resend Email{" "}
                          {resendCooldown.isActive &&
                            `(${resendCooldown.seconds}s)`}
                        </Button>
                      </HStack>
                    </Alert.Description>
                  </Alert.Root>
                )}
              </VStack>
            )}
          </Formik>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};
