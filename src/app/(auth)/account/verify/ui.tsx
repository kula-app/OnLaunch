"use client";

import { requestAccountVerificationEmail } from "@/app/actions/request-account-verification-email";
import { verifyEmail } from "@/app/actions/verify-account";
import { AuthCoverImageColumn } from "@/components/auth/AuthCoverImageColumn";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { CustomErrorNames } from "@/errors/custom-error-names";
import { ServerError } from "@/errors/server-error";
import { useCooldown } from "@/hooks/useCooldown";
import Routes from "@/routes/routes";
import { Logger } from "@/util/logger";
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

const logger = new Logger(__filename);

const SuspenseBody: React.FC = () => {
  const router = useRouter();
  const toast = useToast();

  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const email = searchParams?.get("email");

  const verifyCooldown = useCooldown(5);
  const resendLinkCooldown = useCooldown(60);

  const [isLoading, setIsLoading] = useState(false);
  // Prevent multiple automatic attempts
  const [isAttempted, setAttempted] = useState(false);

  const [isVerified, setVerified] = useState(false);
  const [isExpired, setExpired] = useState(false);
  const [isObsolete, setObsolete] = useState(false);
  const [isAlreadyVerified, setAlreadyVerified] = useState(false);

  const verifyUser = useCallback(
    async (token: string, email: string) => {
      logger.log(`Verifying user by token with email: ${email}`);
      setVerified(false);
      setExpired(false);
      setObsolete(false);
      setAlreadyVerified(false);

      setIsLoading(true);
      try {
        const result = await verifyEmail(email, token);
        verifyCooldown.start();

        if (result.success) {
          setVerified(true);
        } else if (result.error?.name === CustomErrorNames.TokenExpiredError) {
          setExpired(true);
        } else if (result.error?.name === CustomErrorNames.TokenObsoleteError) {
          setObsolete(true);
        } else if (
          result.error?.name === CustomErrorNames.UserAlreadyVerifiedError
        ) {
          setAlreadyVerified(true);
        } else if (result.error) {
          throw new ServerError(result.error.name, result.error.message);
        }
      } catch (error: any) {
        toast({
          title: "An unexpected error occured",
          description: `${error.message}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
      setIsLoading(false);
    },
    [toast, verifyCooldown],
  );

  useEffect(() => {
    // If token and email are present, verify user
    if (token && email && !isAttempted) {
      setAttempted(true);
      verifyUser(token, email);
    }
  }, [token, email, verifyUser, isAttempted]);

  async function resendLink(email: string) {
    try {
      const result = await requestAccountVerificationEmail(email);
      if (!result.success) {
        throw new ServerError(result.error.name, result.error.message);
      }
      resendLinkCooldown.start();

      toast({
        title: "Success!",
        description: "Link was sent again.",
        status: "success",
        isClosable: true,
        duration: 6000,
      });
    } catch (error) {
      toast({
        title: "Error while sending verification link!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

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
                spacing={"16px"}
              >
                <VStack textAlign={"left"} align={"left"} w={"100%"}>
                  <Text
                    fontSize="4xl"
                    lineHeight="39px"
                    color="white"
                    fontWeight="bold"
                  >
                    Verify Account
                  </Text>
                </VStack>

                <VStack w={"full"} color="white">
                  {!isVerified &&
                    !isAlreadyVerified &&
                    !isExpired &&
                    !isObsolete && (
                      <>
                        <Text w={"full"}>
                          Please verify your account by clicking the button
                          below.
                        </Text>
                        <Button
                          variant="brand"
                          type="submit"
                          w="100%"
                          minH="50"
                          mt={"6px"}
                          isLoading={isLoading}
                          onClick={async () => {
                            if (email && token) {
                              await verifyUser(token, email);
                            }
                          }}
                          isDisabled={verifyCooldown.isActive}
                        >
                          VERIFY
                          {verifyCooldown.isActive &&
                            ` (${verifyCooldown.seconds}s)`}
                        </Button>
                      </>
                    )}
                  {(isVerified || isAlreadyVerified) && (
                    <>
                      <Text w={"full"}>
                        {isVerified
                          ? "Your account is now verified."
                          : isAlreadyVerified &&
                            "Your account has already been verified."}
                      </Text>
                      <Text w={"full"}>
                        You can now log in with your email and password.
                      </Text>
                      <Button
                        variant="brand"
                        type={"button"}
                        w="100%"
                        minH="50"
                        mt={"6px"}
                        onClick={() =>
                          router.push(
                            Routes.login({
                              email: email,
                              reason: "account-verified",
                            }),
                          )
                        }
                      >
                        Go to Login
                      </Button>
                    </>
                  )}
                  {isObsolete && (
                    <>
                      <Text w={"full"}>
                        The verification link is no longer valid, because a
                        newer one has been sent!{" "}
                      </Text>
                      <Text w={"full"}>
                        Please use the latest link to verify your account.{" "}
                      </Text>
                      <Text w={"full"}>
                        If you didn&apos;t receive a new link, you can request
                        one below.
                      </Text>
                      <Button
                        variant="brand"
                        type="submit"
                        w="100%"
                        minH="50"
                        mt={"6px"}
                        isLoading={isLoading}
                        onClick={() => {
                          if (email) {
                            resendLink(email);
                          }
                        }}
                        isDisabled={resendLinkCooldown.isActive}
                      >
                        Send Link Again
                        {resendLinkCooldown.isActive &&
                          ` (${resendLinkCooldown.seconds}s)`}
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

export const UI: React.FC = () => {
  return (
    <Suspense>
      <SuspenseBody />
    </Suspense>
  );
};
