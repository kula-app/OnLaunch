"use client";

import signupUser from "@/api/users/signupUser";
import AuthFooter from "@/app/(auth)/(components)/AuthFooter";
import GradientBorder from "@/app/(auth)/(components)/GradientBorder";
import Routes from "@/routes/routes";
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
import NextLink from "next/link";
import * as Yup from "yup";
import { AuthCoverImageColumn } from "../(components)/AuthCoverImageColumn";
import { AuthHeader } from "../(components)/AuthHeader";
import { AuthLegalConsent } from "../(components)/AuthLegalConsent";
import { AuthSocialLogin } from "../(components)/AuthSocialLogin";
import { AuthTextField } from "../(components)/AuthTextField";
import { AuthVerificationEmailSent } from "../(components)/AuthVerificationEmailSent";

const SignupFormSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const UI: NextPage = () => {
  const toast = useToast();

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
          maxW={{ base: "100%", lg: "580px" }}
        >
          <VStack my={{ lg: "60px" }} align={"center"} spacing={0}>
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
              <GradientBorder p="2px">
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
                        await signupUser(
                          values.email,
                          values.password,
                          values.firstName,
                          values.lastName
                        );
                        setStatus({
                          isWaitingVerificationForEmail: values.email,
                        });
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
                            />
                          )}
                          {!props.status.isWaitingVerificationForEmail && (
                            <VStack spacing={"18px"} w={"100%"}>
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
                                variant="brand"
                                w="100%"
                                minH="50"
                                isLoading={props.isSubmitting}
                                mt={"6px"}
                              >
                                SIGN UP
                              </Button>
                              <AuthSocialLogin />
                              <AuthLegalConsent action={"sign-up"} />
                            </VStack>
                          )}
                          <Text color={"gray.400"} fontWeight="medium">
                            Already have an account?
                            <Link
                              as={NextLink}
                              color={"white"}
                              ms="5px"
                              href={Routes.LOGIN}
                              fontWeight="bold"
                            >
                              Sign In
                            </Link>
                          </Text>
                        </VStack>
                      </Form>
                    )}
                  </Formik>
                </VStack>
              </GradientBorder>
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
