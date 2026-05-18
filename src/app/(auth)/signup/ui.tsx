"use client";

import { signUp } from "@/app/actions/sign-up";
import { AuthCoverImageColumn } from "@/components/auth/AuthCoverImageColumn";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthGradientBorder } from "@/components/auth/AuthGradientBorder";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLegalConsent } from "@/components/auth/AuthLegalConsent";
import { AuthSocialLogin } from "@/components/auth/AuthSocialLogin";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { AuthVerificationEmailSent } from "@/components/auth/AuthVerificationEmailSent";
import { Routes } from "@/routes/routes";
import { toaster } from "@/components/ui/toaster";
import { Box, Button, Flex, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import NextLink from "next/link";
import * as Yup from "yup";

const SignupFormSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const UI: NextPage = () => {
  return (
    <HStack gap={0} align={"stretch"}>
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
          maxW={{ base: "100%", lg: "580px" }}
        >
          <VStack my={{ lg: "60px" }} align={"center"} gap={0}>
            <AuthHeader />
            <VStack mb={{ lg: "16px" }} mx={"32px"} textAlign={"center"}>
              <Text
                fontSize="4xl"
                lineHeight="39px"
                color="white"
                fontWeight="bold"
              >
                Get started in seconds!
              </Text>
              <Text
                fontSize="md"
                color="white"
                fontWeight="normal"
                mt="10px"
                w={{ base: "100%", md: "80%" }}
              >
                OnLaunch helps you to to remotely control the launch behaviour
                of your app, encouraging updates, informing users about
                maintenance and notifying about latest features.
              </Text>
            </VStack>
            <Box p={"30px"} w={"100%"} maxW={{ base: "650px", lg: "450px" }}>
              <AuthGradientBorder p="2px">
                <VStack
                  background="transparent"
                  borderRadius="30px"
                  direction="column"
                  bg="#131538"
                  p={{
                    base: "24px",
                    md: "32px",
                    lg: "32px",
                  }}
                  w={"100%"}
                >
                  <Formik
                    initialValues={{
                      firstName: "",
                      lastName: "",
                      email: "",
                      password: "",
                    }}
                    initialStatus={{
                      isWaitingVerificationForEmail: undefined,
                    }}
                    validationSchema={SignupFormSchema}
                    onSubmit={async (values, { setStatus }) => {
                      try {
                        await signUp({
                          email: values.email,
                          password: values.password,
                          firstName: values.firstName,
                          lastName: values.lastName,
                        });
                        setStatus({
                          isWaitingVerificationForEmail: values.email,
                        });
                      } catch (error: any) {
                        toaster.create({
                          title: "Error while creating user",
                          description: `${error.message}`,
                          type: "error",
                          closable: true,
                          duration: 6000,
                        });
                      }
                    }}
                  >
                    {(props) => (
                      <Form style={{ width: "100%" }}>
                        <VStack gap={"32px"} w={"100%"}>
                          {props.status.isWaitingVerificationForEmail && (
                            <AuthVerificationEmailSent
                              email={props.status.isWaitingVerificationForEmail}
                            />
                          )}
                          {!props.status.isWaitingVerificationForEmail && (
                            <VStack gap={"18px"} w={"100%"}>
                              <AuthTextField
                                name={"firstName"}
                                label={"First Name"}
                                type={"text"}
                                placeholder={"Your first name"}
                                autoComplete={"given-name"}
                              />
                              <AuthTextField
                                name={"lastName"}
                                label={"Last Name"}
                                type={"text"}
                                placeholder={"Your last name"}
                                autoComplete={"family-name"}
                              />
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
                                autoComplete={"new-password"}
                              />
                              <Button
                                type="submit"
                                colorPalette="brand"
                                w="100%"
                                minH="50"
                                loading={props.isSubmitting}
                                mt={"6px"}
                              >
                                Sign Up
                              </Button>
                              <AuthSocialLogin />
                              <AuthLegalConsent action={"sign-up"} />
                            </VStack>
                          )}
                          <Text color={"gray.400"} fontWeight="medium">
                            Already have an account?
                            <Link color={"white"} ms="5px" fontWeight="bold" asChild><NextLink href={Routes.login()}>Sign In
                                                          </NextLink></Link>
                          </Text>
                        </VStack>
                      </Form>
                    )}
                  </Formik>
                </VStack>
              </AuthGradientBorder>
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
