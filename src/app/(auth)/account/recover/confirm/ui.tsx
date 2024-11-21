"use client";

import { resetPassword } from "@/app/actions/reset-password";
import { AuthCoverImageColumn } from "@/components/auth/AuthCoverImageColumn";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthTextField } from "@/components/auth/AuthTextField";
import Routes from "@/routes/routes";
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import * as Yup from "yup";

const AccountRecoverConfirmFormSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const SuspenseBody: React.FC = () => {
  const router = useRouter();
  const toast = useToast();

  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  if (!token) {
    return (
      <Text w={"full"} color={"white"}>
        Missing recovery token.
      </Text>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          password: "",
        }}
        validationSchema={AccountRecoverConfirmFormSchema}
        onSubmit={async (values) => {
          try {
            await resetPassword({
              token: token,
              password: values.password,
            });
            // Redirect to login page with reason, to show a success message
            router.push(
              Routes.login({
                reason: "account-recovered",
              }),
            );
          } catch (error: any) {
            toast({
              title: "Error while resetting password!",
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
              <Text
                fontSize="md"
                color="white"
                fontWeight="normal"
                mt="10px"
                w={"full"}
              >
                You have confirmed your email, and may now update your password
                below.
              </Text>

              <VStack
                spacing={"18px"}
                w={"100%"}
                color={"white"}
                align={"start"}
              >
                <AuthTextField
                  label={"Password"}
                  name={"password"}
                  type={"password"}
                  placeholder={"•••••••••••••••••"}
                  autoComplete={"new-password"}
                />
                <Button
                  variant="brand"
                  type="submit"
                  w="100%"
                  minH="50"
                  mt={"6px"}
                  isLoading={props.isSubmitting}
                >
                  Change Password
                </Button>
              </VStack>
            </VStack>
          </Form>
        )}
      </Formik>
    </>
  );
};

const UI: NextPage = () => {
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
                <VStack textAlign={"left"} align={"left"} w={"100%"}>
                  <Text
                    fontSize="4xl"
                    lineHeight="39px"
                    color="white"
                    fontWeight="bold"
                  >
                    Recover Account
                  </Text>
                </VStack>
                <Suspense>
                  <SuspenseBody />
                </Suspense>
              </VStack>
            </Box>
            <AuthFooter />
          </VStack>
        </Flex>
      </Flex>
    </HStack>
  );
};

export default UI;
