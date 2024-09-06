"use client";

import createPasswordResetToken from "@/api/tokens/createPasswordResetToken";
import AuthFooter from "@/app/(auth)/(components)/AuthFooter";
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
import * as Yup from "yup";
import { AuthCoverImageColumn } from "../../(components)/AuthCoverImageColumn";
import { AuthHeader } from "../../(components)/AuthHeader";
import { AuthTextField } from "../../(components)/AuthTextField";

const LoginFormSchema = Yup.object().shape({
  email: Yup.string().required("Email is required"),
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
                <Formik
                  initialValues={{
                    email: "",
                  }}
                  validationSchema={LoginFormSchema}
                  initialStatus={{
                    isSent: undefined,
                  }}
                  onSubmit={async (values, { setStatus }) => {
                    try {
                      await createPasswordResetToken(values.email);
                      setStatus({
                        isSent: values.email,
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
                        <Text
                          fontSize="md"
                          color="white"
                          fontWeight="normal"
                          mt="10px"
                          w={"full"}
                        >
                          {props.status.isSent ? (
                            <>
                              We have sent an email to the address registered
                              with this account containing further instructions
                              to reset your password.
                            </>
                          ) : (
                            <>
                              Enter your email and we&apos;ll send you a link to
                              recover access to your account.
                            </>
                          )}
                        </Text>

                        {!props.status.isSent && (
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
                            <Button
                              variant="brand"
                              type="submit"
                              w="100%"
                              minH="50"
                              mt={"6px"}
                              isLoading={props.isSubmitting}
                            >
                              Send Email
                            </Button>
                          </VStack>
                        )}
                      </VStack>
                    </Form>
                  )}
                </Formik>
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
