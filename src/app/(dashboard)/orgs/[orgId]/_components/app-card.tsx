"use client";

import type { App } from "@/models/app";
import type { Org } from "@/models/org";
import { Routes } from "@/routes/routes";
import { Box, Card, CardBody, Icon, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { FiPlus } from "react-icons/fi";

export const AppCard: React.FC<{
  orgId: Org["id"];
  appId: App["id"];
  name: App["name"];
  type?: "create";
  bg: string;
  color: string;
}> = ({ orgId, appId, bg, name, type, color }) => {
  const router = useRouter();

  return (
    <Card
      cursor={"pointer"}
      onClick={() => {
        if (type === "create") {
          router.push(
            Routes.createApp({
              orgId: orgId,
            }),
          );
        } else {
          router.push(
            Routes.app({
              orgId: orgId,
              appId: appId,
            }),
          );
        }
      }}
    >
      <CardBody
        display={"flex"}
        alignItems={"center"}
        flexDir={"row"}
        p={4}
        _hover={{
          bg: "#8991E6",
          borderRadius: 20,
        }}
        _active={{
          bg: "rgba(10, 14, 35, 0.49)",
          borderRadius: 20,
        }}
      >
        <Box
          bg={bg ?? color}
          color={color ?? "white"}
          fontWeight="bold"
          width={10}
          height={10}
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mr={3}
        >
          {type == "create" ? <Icon as={FiPlus} /> : name.substring(0, 1)}
        </Box>
        <Text fontWeight="medium" color="white" maxH={10}>
          {name}
        </Text>
      </CardBody>
    </Card>
  );
};
