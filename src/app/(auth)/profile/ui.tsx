"use client";

import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Container,
  Flex,
  Heading,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { ChangeEmailCard } from "./_components/change-email-card";
import { ChangePasswordCard } from "./_components/change-password-card";
import { DeleteProfileCard } from "./_components/delete-profile-card";

export const UI: React.FC = () => {
  const {
    user,
    isLoading: isLoadingUser,
    error: userError,
    refresh: refreshUser,
  } = useAuthenticatedUser();

  return (
    <>
      <Flex direction={"column"} minH={"100vh"}>
        <ConfiguredNavigationBar items={[{ kind: "profile" }]} />
        <Container maxW={"6xl"}>
          <VStack p={4} w={"full"} gap={8}>
            <Heading size={"lg"} as={"h1"} color={"white"} w={"full"}>
              <Skeleton isLoaded={!isLoadingUser}>
                {user?.firstName ? (
                  <Text>Hello, {user?.firstName}!</Text>
                ) : (
                  <Text>Hello!</Text>
                )}
              </Skeleton>
            </Heading>
            {userError && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Failed to fetch profile</AlertTitle>
                <AlertDescription>{userError.message}</AlertDescription>
              </Alert>
            )}
            <ChangeEmailCard user={user} refreshUser={refreshUser} />
            <ChangePasswordCard />
            <DeleteProfileCard />
          </VStack>
        </Container>
      </Flex>
    </>
  );
};
