"use client";

import Routes from "@/routes/routes";
import { Flex, Link, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";

export const AuthCoverImageColumn: React.FC = () => {
  return (
    <Link as={NextLink} href={Routes.dashboard}>
      <Flex
        direction={"column"}
        align={"center"}
        justify={"center"}
        display={{ base: "none", lg: "flex" }}
        w={{ lg: "50vw" }}
        minH="100vh"
        bgImage={"/assets/img/sign-in-image.webp"}
        bgSize={"cover"}
        bgPosition="50%"
      >
        <VStack my={{ base: "60px" }} align={"center"} spacing={0}>
          <Text
            textAlign="center"
            color="white"
            letterSpacing="2px"
            fontSize="20px"
            fontWeight="bold"
          >
            SAY HI TO YOUR APP USERS
          </Text>
          <Text
            textAlign="center"
            color="white"
            fontSize="48px"
            fontWeight="500"
          >
            OnLaunch
          </Text>
        </VStack>
      </Flex>
    </Link>
  );
};
