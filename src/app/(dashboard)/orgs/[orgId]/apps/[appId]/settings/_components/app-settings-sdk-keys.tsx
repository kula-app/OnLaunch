"use client";

import { useApp } from "@/hooks/use-app";
import type { App } from "@/models/app";
import {
  Alert,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  VStack,
  Field,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FaCopy } from "react-icons/fa6";
import { FetchMessagesFromAPISection } from "./fetch-messages-from-api-section";
import { SDKCard } from "./sdk-card";

export const AppSettingsSDKKeys: React.FC<{
  appId: App["id"];
}> = ({ appId }) => {
  const { app, error: appError } = useApp({ appId });

  const sdks: {
    id: string;
    name: string;
    imageUrl: string;
    url?: string;
  }[] = [
    {
      id: "android",
      name: "Android",
      imageUrl: "/assets/img/android-head_flat.svg",
      url: "https://github.com/kula-app/OnLaunch-Android-Client",
    },
    {
      id: "ios",
      name: "iOS",
      imageUrl: "/assets/img/apple-icon.svg",
      url: "https://github.com/kula-app/OnLaunch-iOS-Client",
    },
    {
      id: "flutter",
      name: "Flutter",
      imageUrl: "/assets/img/icon_flutter.svg",
      url: "https://github.com/kula-app/OnLaunch-Flutter-Client",
    },
    {
      id: "react-native",
      name: "React Native",
      imageUrl: "/assets/img/react-native-logo_light.svg",
      url: "https://github.com/kula-app/OnLaunch-React-Native-Client",
    },
    {
      id: "capacitor",
      name: "Capacitor",
      imageUrl: "/assets/img/capacitor.svg",
      url: "https://github.com/kula-app/OnLaunch-Capacitor-Client",
    },
  ];

  return (
    <>
      <Flex direction={"column"} w={"full"} align={"start"} gap={8}>
        {appError && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Failed to fetch app</Alert.Title>
            <Alert.Description>{appError.message}</Alert.Description>
          </Alert.Root>
        )}
        <VStack direction={"column"} w={"full"} align={"end"}>
          <Field.Root color="white" w={"full"}>
            <Field.Label fontWeight={"bold"}>App Public Key</Field.Label>
            <HStack>
              <InputGroup
                variant={"brand-on-card"}
                endElement={
                  <IconButton
                    colorPalette={"whiteAlpha"}
                    aria-label="Copy Public Key"
                    roundedLeft={"none"}
                    roundedRight={"full"}
                    onClick={() => {
                      navigator.clipboard.writeText(app?.publicKey ?? "");
                      toaster.create({
                        title: "Public key copied to clipboard.",
                        type: "info",
                      });
                    }}><FaCopy /></IconButton>
                }
              >
                <Input
                  id="invite"
                  value={app?.publicKey ?? ""}
                  readOnly
                  fontSize={"sm"}
                />
              </InputGroup>
            </HStack>
            <Field.HelperText color={"gray.200"}>
              Use this key in your Client SDK to connect to this app.
            </Field.HelperText>
          </Field.Root>
        </VStack>
        <VStack w={"full"} gap={4}>
          <Heading size={"md"} color={"white"} w={"full"}>
            Choose your platform
          </Heading>
          <Grid templateColumns={"repeat(8, 1fr)"} gap={4} w={"full"}>
            {sdks.map((sdk) => (
              <SDKCard key={sdk.id} sdk={sdk} />
            ))}
          </Grid>
        </VStack>
        <FetchMessagesFromAPISection apiKey={app?.publicKey} />
      </Flex>
    </>
  );
};
