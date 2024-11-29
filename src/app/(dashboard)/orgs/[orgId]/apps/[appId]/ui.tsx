"use client";

import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { MessageList } from "@/components/message-list";
import { useApp } from "@/hooks/use-app";
import { useMessages } from "@/hooks/use-messages";
import Routes from "@/routes/routes";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  Skeleton,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FaGear, FaPlus } from "react-icons/fa6";
import { AppMetrics } from "./_components/app-metrics";

export const UI: React.FC<{
  orgId: number;
  appId: number;
}> = ({ orgId, appId }) => {
  const router = useRouter();

  const { isLoading: isLoadingApp, app } = useApp({ appId });
  const { isLoading: isLoadingMessages, messages } = useMessages({
    appId,
    filter: "active",
  });

  return (
    <>
      <Flex direction={"column"} minH={"100vh"}>
        <ConfiguredNavigationBar
          items={[
            { kind: "orgs" },
            { kind: "org", orgId },
            { kind: "apps", orgId },
            { kind: "app", orgId, appId },
          ]}
        />
        <Container maxW={"6xl"}>
          <VStack p={4} w={"full"} gap={8}>
            <HStack w={"full"}>
              <Skeleton isLoaded={!isLoadingApp}>
                <Heading size={"lg"} as={"h1"} color={"white"} mb={4}>
                  App &lsquo;{app?.name}&rsquo;
                </Heading>
              </Skeleton>
              <Spacer />
              <IconButton
                icon={<FaGear />}
                onClick={() =>
                  router.push(Routes.appSettings({ orgId, appId }))
                }
                aria-label={"Settings"}
              />
            </HStack>
            <Box w={"full"}>
              <HStack w={"full"} mb={4}>
                <Heading size={"md"} as={"h2"} color={"white"}>
                  Active Messages
                </Heading>
                <Spacer />
                <Button
                  variant={"solid"}
                  colorScheme={"gray"}
                  onClick={() => {
                    router.push(
                      Routes.messages({
                        orgId,
                        appId,
                      }),
                    );
                  }}
                >
                  View All
                </Button>
                <Button
                  colorScheme={"brand"}
                  variant={"solid"}
                  leftIcon={<FaPlus />}
                  onClick={() =>
                    router.push(
                      Routes.createMessage({
                        orgId,
                        appId,
                      }),
                    )
                  }
                >
                  Create Message
                </Button>
              </HStack>
              <MessageList
                isLoading={isLoadingMessages}
                messages={messages ?? []}
                editMessage={(message) => {
                  router.push(
                    Routes.message({
                      orgId,
                      appId,
                      messageId: message.id,
                    }),
                  );
                }}
              />
            </Box>
            <Box w={"full"}>
              <Heading size={"md"} as={"h2"} color={"white"} mb={4}>
                App requests in the past days
              </Heading>
              <AppMetrics appId={appId} orgId={orgId} />
            </Box>
          </VStack>
        </Container>
      </Flex>
    </>
  );
};
