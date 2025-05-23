"use client";

import { AuthCoverImageColumn } from "@/components/auth/AuthCoverImageColumn";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLegalConsent } from "@/components/auth/AuthLegalConsent";
import { AuthSocialLogin } from "@/components/auth/AuthSocialLogin";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { AuthVerificationEmailSent } from "@/components/auth/AuthVerificationEmailSent";
import { Routes } from "@/routes/routes";
import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { signIn } from "next-auth/react";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const LoginFormSchema = Yup.object().shape({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});
type LoginFormValues = Yup.InferType<typeof LoginFormSchema>;

const UI: NextPage = () => {
  const router = useRouter();
  const toast = useToast();

  let [initialValues, setInitialValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams?.has("email")) {
      setInitialValues({
        email: searchParams.get("email") ?? "",
        password: "",
      });
    }
  }, [searchParams]);

  return (
    <HStack spacing={0} align={"stretch"}>
      <AuthCoverImageColumn />
      <Flex
        direction={"column"}
        align={{ base: "center", lg: "start" }}
        justify={{ base: "start", lg: "center" }}
        w={{ base: "full", lg: "50vw" }}
        minH={{ base: "100vh" }}
      >
        <Flex
          direction={"column"}
          align={"start"}
          justify={"center"}
          w={"100%"}
          maxW={{ base: "100%", lg: "580px" }}
        >
          <VStack my={{ lg: "60px" }} align={"center"} spacing={0} w={"100%"}>
            <AuthHeader />
            <Box p={"30px"} w={"100%"} maxW={{ base: "650px", lg: "450px" }}>
              <VStack
                background="transparent"
                borderRadius="30px"
                direction="column"
                p={{
                  base: "24px",
                  md: "32px",
                  lg: "32px",
                }}
                w={"100%"}
              >
                <VStack
                  mb={{ base: "32px" }}
                  textAlign={"left"}
                  align={"left"}
                  w={"100%"}
                >
                  <Text
                    fontSize="4xl"
                    lineHeight="39px"
                    color="white"
                    fontWeight="bold"
                  >
                    Welcome back!
                  </Text>
                  <Text
                    fontSize="md"
                    color="white"
                    fontWeight="normal"
                    mt="10px"
                    w={"100%"}
                  >
                    Enter your email and passsword to sign in to your account
                  </Text>
                </VStack>
                <Formik
                  initialValues={initialValues}
                  enableReinitialize={true}
                  validationSchema={LoginFormSchema}
                  initialStatus={{
                    isWaitingVerificationForEmail: undefined,
                  }}
                  onSubmit={async (values, { setStatus }) => {
                    try {
                      const result = await signIn("credentials", {
                        email: values.email,
                        password: values.password,
                        // Don't redirect and handle redirect in the callback
                        redirect: false,
                      });
                      if (result?.ok) {
                        router.push(
                          searchParams?.get("redirect") ?? Routes.dashboard,
                        );
                      } else if (result?.error) {
                        if (result.error === "Verify account!") {
                          setStatus({
                            isWaitingVerificationForEmail: values.email,
                          });
                        } else {
                          throw new Error(result.error);
                        }
                      } else {
                        throw new Error("Unknown error occurred");
                      }
                    } catch (error: any) {
                      toast({
                        title: "Error while creating user",
                        description: `${error.message}`,
                        status: "error",
                        isClosable: true,
                        duration: 6000,
                      });
                    }
                  }}
                >
                  {(props) => (
                    <Form style={{ width: "100%" }}>
                      <VStack spacing={"32px"} w={"100%"}>
                        {props.status.isWaitingVerificationForEmail && (
                          <AuthVerificationEmailSent
                            email={props.status.isWaitingVerificationForEmail}
                            isBackButtonVisible={true}
                            onBackButtonClick={() => {
                              props.setStatus({
                                isWaitingVerificationForEmail: undefined,
                              });
                            }}
                          />
                        )}
                        {!props.status.isWaitingVerificationForEmail && (
                          <VStack
                            spacing={"18px"}
                            w={"100%"}
                            color={"white"}
                            align={"start"}
                          >
                            <AuthTextField
                              label={"Email"}
                              name={"email"}
                              type={"email"}
                              placeholder={"name@email.com"}
                              autoComplete={"username"}
                            />
                            <AuthTextField
                              label={"Password"}
                              name={"password"}
                              type={"password"}
                              placeholder={"•••••••••••••••••"}
                              autoComplete={"password"}
                            />
                            <VStack w={"100%"} align={"end"}>
                              <Link
                                as={NextLink}
                                color={"white"}
                                href={Routes.accountRecovery}
                                fontWeight="medium"
                              >
                                Forgot password?
                              </Link>
                            </VStack>
                            <Button
                              variant="brand"
                              type="submit"
                              w="100%"
                              minH="50"
                              mt={"6px"}
                              isLoading={props.isSubmitting}
                            >
                              Sign In
                            </Button>
                            <AuthSocialLogin />
                            <AuthLegalConsent action={"sign-in"} />
                          </VStack>
                        )}
                      </VStack>
                    </Form>
                  )}
                </Formik>
                <Text color={"gray.400"} fontWeight="medium" mt={"16px"}>
                  Don&apos;t have an account?
                  <Link
                    as={NextLink}
                    color={"white"}
                    ms="5px"
                    href={Routes.signup}
                    fontWeight="bold"
                  >
                    Sign Up
                  </Link>
                </Text>
              </VStack>
            </Box>
            <Box>
              <AuthFooter />
            </Box>
          </VStack>
        </Flex>
      </Flex>
    </HStack>
  );
};

export default UI;
