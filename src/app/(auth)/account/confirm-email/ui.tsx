"use client";

import { confirmEmailChange } from "@/app/actions/confirm-email-change";
import { AuthCoverImageColumn } from "@/components/auth/AuthCoverImageColumn";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { CustomErrorNames } from "@/errors/custom-error-names";
import { ServerError } from "@/errors/server-error";
import Routes from "@/routes/routes";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  HStack,
  Link,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

export const UI: React.FC<{
  token: string;
}> = ({ token }) => {
  const router = useRouter();
  const toast = useToast();

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
        toast({
          title: "Error while request!",
          description: `${error}`,
          status: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [session, toast],
  );
  useEffect(() => {
    if (token && token && !isAttempted && sessionStatus !== "loading") {
      setAttempted(true);
      submitEmailChangeToken(token);
    }
  }, [token, submitEmailChangeToken, isAttempted, sessionStatus]);

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
        <Flex direction={"column"} justify={"center"} w={"100%"}>
          <VStack my={{ lg: "60px" }} align={"center"} spacing={0} w={"100%"}>
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
                spacing={"16px"}
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
                      <Alert status="error" w={"full"} color={"black"}>
                        <AlertIcon />
                        <VStack align="start" spacing={0}>
                          <AlertTitle>
                            The confirmation link is invalid.
                          </AlertTitle>
                          <AlertTitle>
                            To confirm your email, please request a new one from
                            your user profile.
                          </AlertTitle>
                        </VStack>
                      </Alert>
                      <Link href={Routes.profile} w={"full"}>
                        <Button
                          variant="brand"
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
                      <Alert status="error" w={"full"} color={"black"}>
                        <AlertIcon />
                        <VStack align="start" spacing={0}>
                          <AlertTitle>
                            This confirmation link has already been used.
                          </AlertTitle>
                          <AlertDescription>
                            If you didn&apos;t confirm your email yet, please
                            request a new one from your user profile.
                          </AlertDescription>
                        </VStack>
                      </Alert>
                      <Link href={Routes.profile} w={"full"}>
                        <Button
                          variant="brand"
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
                      <Alert status="error" w={"full"} color={"black"}>
                        <AlertIcon />
                        <VStack align="start" spacing={0}>
                          <AlertTitle>
                            The confirmation link has expired.{" "}
                          </AlertTitle>
                          <AlertDescription>
                            Please request a new one from your user profile.
                          </AlertDescription>
                        </VStack>
                      </Alert>
                      <Link href={Routes.profile} w={"full"}>
                        <Button
                          variant="brand"
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
                      <Alert status="error" w={"full"} color={"black"}>
                        <AlertIcon />
                        <VStack align="start" spacing={0}>
                          <AlertTitle>Link is not valid anymore!</AlertTitle>
                          <AlertDescription>
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
                          </AlertDescription>
                        </VStack>
                      </Alert>
                      <Link href={Routes.profile} w={"full"}>
                        <Button
                          variant="brand"
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
                        variant="brand"
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
                      <Alert status="success" w={"full"} color={"black"}>
                        <AlertIcon />
                        <VStack align="start" spacing={0}>
                          <AlertTitle>
                            Your email has been confirmed.
                          </AlertTitle>
                          <AlertDescription>
                            You can now log in with your new email and password.
                          </AlertDescription>
                        </VStack>
                      </Alert>
                      <Link
                        href={Routes.login({
                          reason: "email-confirmation",
                          email: confirmedEmail,
                        })}
                        w={"full"}
                      >
                        <Button
                          variant="brand"
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
                        variant="brand"
                        type={"button"}
                        w="100%"
                        minH="50"
                        mt={"6px"}
                        isLoading={isLoading}
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
