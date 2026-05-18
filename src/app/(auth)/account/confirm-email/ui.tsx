"use client";

import { confirmEmailChange } from "@/app/actions/confirm-email-change";
import { AuthCoverImageColumn } from "@/components/auth/AuthCoverImageColumn";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { CustomErrorNames } from "@/errors/custom-error-names";
import { ServerError } from "@/errors/server-error";
import { Routes } from "@/routes/routes";
import { toaster } from "@/components/ui/toaster";
import { Alert, Box, Button, Flex, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

export const UI: React.FC<{
  token: string;
}> = ({ token }) => {
  const router = useRouter();

  const { data: session, status: sessionStatus } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  // Prevent multiple automatic attempts
  const [isAttempted, setAttempted] = useState(false);

  const [isInvalid, setInvalid] = useState(false);
  const [isTokenUsed, setTokenUsed] = useState(false);
  const [isExpired, setExpired] = useState(false);
  const [isObsolete, setObsolete] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState<string>();
  const [isConfirmed, setConfirmed] = useState(false);
  const [isAlreadyConfirmed, setAlreadyConfirmed] = useState(false);

  const submitEmailChangeToken = useCallback(
    async (token: string) => {
      setIsLoading(true);
      try {
        const response = await confirmEmailChange({
          token: token,
        });
        if (response.success) {
          setConfirmedEmail(response.value.email);
          setConfirmed(true);

          if (session) {
            signOut({
              redirect: false,
            });
          }
        } else if (response.error?.name === CustomErrorNames.NotFoundError) {
          setInvalid(true);
        } else if (response.error?.name === CustomErrorNames.TokenUsedError) {
          setTokenUsed(true);
        } else if (
          response.error?.name === CustomErrorNames.TokenExpiredError
        ) {
          setExpired(true);
        } else if (
          response.error?.name === CustomErrorNames.TokenObsoleteError
        ) {
          setObsolete(true);
        } else if (
          response.error?.name === CustomErrorNames.UserAlreadyVerifiedError
        ) {
          setAlreadyConfirmed(true);
        } else if (response.error) {
          throw new ServerError(response.error.name, response.error.message);
        }
      } catch (error) {
        toaster.create({
          title: "Error while request!",
          description: `${error}`,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [session],
  );
  useEffect(() => {
    if (token && token && !isAttempted && sessionStatus !== "loading") {
      setAttempted(true);
      submitEmailChangeToken(token);
    }
  }, [token, submitEmailChangeToken, isAttempted, sessionStatus]);

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
        <Flex direction={"column"} justify={"center"} w={"100%"}>
          <VStack my={{ lg: "60px" }} align={"center"} gap={0} w={"100%"}>
            <AuthHeader />
            <Box p={"30px"} w={"100%"}>
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
                gap={"16px"}
              >
                <VStack textAlign={"left"} align={"left"} w={"100%"}>
                  <Text
                    fontSize="4xl"
                    lineHeight="39px"
                    color="white"
                    fontWeight="bold"
                  >
                    Confirm Email
                  </Text>
                </VStack>

                <VStack w={"full"} color="white">
                  {isInvalid ? (
                    <>
                      <Alert.Root status="error" w={"full"} color={"black"}>
                        <Alert.Indicator />
                        <VStack align="start" gap={0}>
                          <Alert.Title>
                            The confirmation link is invalid.
                          </Alert.Title>
                          <Alert.Title>
                            To confirm your email, please request a new one from
                            your user profile.
                          </Alert.Title>
                        </VStack>
                      </Alert.Root>
                      <Link href={Routes.profile} w={"full"}>
                        <Button
                          colorPalette="brand"
                          type={"button"}
                          w={"full"}
                          mt={"6px"}
                          rounded={"full"}
                        >
                          Go to Profile
                        </Button>
                      </Link>
                    </>
                  ) : isTokenUsed ? (
                    <>
                      <Alert.Root status="error" w={"full"} color={"black"}>
                        <Alert.Indicator />
                        <VStack align="start" gap={0}>
                          <Alert.Title>
                            This confirmation link has already been used.
                          </Alert.Title>
                          <Alert.Description>
                            If you didn&apos;t confirm your email yet, please
                            request a new one from your user profile.
                          </Alert.Description>
                        </VStack>
                      </Alert.Root>
                      <Link href={Routes.profile} w={"full"}>
                        <Button
                          colorPalette="brand"
                          type={"button"}
                          w={"full"}
                          mt={"6px"}
                          rounded={"full"}
                        >
                          Go to Profile
                        </Button>
                      </Link>
                    </>
                  ) : isExpired ? (
                    <>
                      <Alert.Root status="error" w={"full"} color={"black"}>
                        <Alert.Indicator />
                        <VStack align="start" gap={0}>
                          <Alert.Title>
                            The confirmation link has expired.{" "}
                          </Alert.Title>
                          <Alert.Description>
                            Please request a new one from your user profile.
                          </Alert.Description>
                        </VStack>
                      </Alert.Root>
                      <Link href={Routes.profile} w={"full"}>
                        <Button
                          colorPalette="brand"
                          type={"button"}
                          w={"full"}
                          mt={"6px"}
                          rounded={"full"}
                        >
                          Go to Profile
                        </Button>
                      </Link>
                    </>
                  ) : isObsolete ? (
                    <>
                      <Alert.Root status="error" w={"full"} color={"black"}>
                        <Alert.Indicator />
                        <VStack align="start" gap={0}>
                          <Alert.Title>Link is not valid anymore!</Alert.Title>
                          <Alert.Description>
                            <Text>
                              The confirmation link is no longer valid, because
                              a newer one has been sent!
                            </Text>
                            <Text>
                              Please use the latest link to confirm your new
                              email.
                            </Text>
                            <Text>
                              If you didn&apos;t receive a new link, you can
                              request a new one in your user profile.
                            </Text>
                          </Alert.Description>
                        </VStack>
                      </Alert.Root>
                      <Link href={Routes.profile} w={"full"}>
                        <Button
                          colorPalette="brand"
                          type={"button"}
                          w="100%"
                          mt={"6px"}
                          rounded={"full"}
                        >
                          Go to Profile
                        </Button>
                      </Link>
                    </>
                  ) : isAlreadyConfirmed ? (
                    <>
                      <Text w={"full"}>
                        Your email has already been confirmed.
                      </Text>
                      <Text w={"full"}>
                        You can now log in with your new email and password.
                      </Text>
                      <Button
                        colorPalette="brand"
                        type={"button"}
                        w={"full"}
                        mt={"6px"}
                        onClick={() =>
                          router.push(
                            Routes.login({
                              reason: "email-confirmation",
                            }),
                          )
                        }
                      >
                        Go to Login
                      </Button>
                    </>
                  ) : isConfirmed ? (
                    <>
                      <Alert.Root status="success" w={"full"} color={"black"}>
                        <Alert.Indicator />
                        <VStack align="start" gap={0}>
                          <Alert.Title>
                            Your email has been confirmed.
                          </Alert.Title>
                          <Alert.Description>
                            You can now log in with your new email and password.
                          </Alert.Description>
                        </VStack>
                      </Alert.Root>
                      <Link
                        href={Routes.login({
                          reason: "email-confirmation",
                          email: confirmedEmail,
                        })}
                        w={"full"}
                      >
                        <Button
                          colorPalette="brand"
                          type={"button"}
                          w="100%"
                          mt={"6px"}
                          rounded={"full"}
                        >
                          Go to Login
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Text w={"full"}>
                        {isLoading ? (
                          <>Confirming your new email...</>
                        ) : (
                          <>
                            Please confirm your new email by clicking the button
                            below.
                          </>
                        )}
                      </Text>
                      <Button
                        colorPalette="brand"
                        type={"button"}
                        w="100%"
                        minH="50"
                        mt={"6px"}
                        loading={isLoading}
                        onClick={() => {
                          submitEmailChangeToken(token);
                        }}
                      >
                        Confirm Email
                      </Button>
                    </>
                  )}
                </VStack>
              </VStack>
            </Box>
            <AuthFooter />
          </VStack>
        </Flex>
      </Flex>
    </HStack>
  );
};
