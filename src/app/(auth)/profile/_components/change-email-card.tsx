"use client";

import { createEmailChangeToken } from "@/app/actions/create-email-change-token";
import { resendEmailConfirmationToken } from "@/app/actions/resend-email-confirmation-token";
import { ServerError } from "@/errors/server-error";
import { useCooldown } from "@/hooks/useCooldown";
import type { User } from "@/models/user";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
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
  const toast = useToast();

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

        toast({
          title: "Success!",
          description: "Please check your mails.",
          status: "success",
        });
      } catch (error) {
        toast({
          title: "Error while sending request!",
          description: `${error}`,
          status: "error",
        });
      }
    },
    [refreshUser, toast],
  );
  const onSubmitResend = useCallback(async () => {
    setIsResending(true);
    resendCooldown.start();
    try {
      const response = await resendEmailConfirmationToken();
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }

      toast({
        title: "Success!",
        description: "Please check your mails.",
        status: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to send email!",
        description: `${error}`,
        status: "error",
      });
    } finally {
      setIsResending(false);
    }
  }, [toast, resendCooldown]);

  return (
    <Box w={"full"}>
      <Heading size={"md"} as={"h2"} color={"white"} mb={4}>
        Change Email
      </Heading>
      <Card p={4} w={"full"}>
        <CardBody>
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
                      <FormControl
                        color="white"
                        w={"full"}
                        isInvalid={isFieldInvalid}
                      >
                        <FormLabel htmlFor={field.name}>Email</FormLabel>
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
                  isDisabled={!props.dirty}
                  onClick={props.submitForm}
                >
                  Update
                </Button>
                {user?.unconfirmedEmail && (
                  <Alert status="warning" w={"full"} mt={4}>
                    <AlertIcon />
                    <AlertDescription w={"full"}>
                      <HStack w={"full"} justify={"space-between"}>
                        <Text>
                          Please verify your new email address by clicking the
                          link we sent to{" "}
                          <strong>{user.unconfirmedEmail}</strong>
                        </Text>
                        <Button
                          colorScheme="orange"
                          size="sm"
                          variant={"outline"}
                          isLoading={isResending}
                          disabled={resendCooldown.isActive}
                          onClick={onSubmitResend}
                        >
                          Resend Email{" "}
                          {resendCooldown.isActive &&
                            `(${resendCooldown.seconds}s)`}
                        </Button>
                      </HStack>
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>
            )}
          </Formik>
        </CardBody>
      </Card>
    </Box>
  );
};
