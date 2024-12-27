"use client";

import { useApp } from "@/hooks/use-app";
import type { App } from "@/models/app";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  AspectRatio,
  Box,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { FaCopy } from "react-icons/fa6";

export const AppSettingsSDKKeys: React.FC<{
  appId: App["id"];
}> = ({ appId }) => {
  const toast = useToast();
  const { app, error: appError } = useApp({ appId });

  const sdks: {
    id: string;
    name: string;
    imageUrl: string;
    url: string;
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
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Failed to fetch app</AlertTitle>
            <AlertDescription>{appError.message}</AlertDescription>
          </Alert>
        )}
        <VStack direction={"column"} w={"full"} align={"end"}>
          <FormControl color="white" w={"full"}>
            <FormLabel fontWeight={"bold"}>App Public Key</FormLabel>
            <HStack>
              <InputGroup variant={"brand-on-card"}>
                <Input
                  id="invite"
                  value={app?.publicKey ?? ""}
                  readOnly
                  fontSize={"sm"}
                />
                <InputRightElement>
                  <IconButton
                    colorScheme={"whiteAlpha"}
                    aria-label="Copy Public Key"
                    icon={<FaCopy />}
                    roundedLeft={"none"}
                    roundedRight={"full"}
                    onClick={() => {
                      navigator.clipboard.writeText(app?.publicKey ?? "");
                      toast({
                        title: "Success!",
                        description: "Public key copied to clipboard.",
                        status: "success",
                      });
                    }}
                  />
                </InputRightElement>
              </InputGroup>
            </HStack>
            <FormHelperText color={"gray.200"}>
              Use this key in your Client SDK to connect to this app.
            </FormHelperText>
          </FormControl>
        </VStack>
        <VStack w={"full"} gap={4}>
          <Heading size={"md"} color={"white"} w={"full"}>
            Choose your platform
          </Heading>
          <Grid templateColumns={"repeat(8, 1fr)"} gap={4} w={"full"}>
            {sdks.map((sdk) => (
              <GridItem key={sdk.id} as={Flex} direction={"column"}>
                <Link href={sdk.url} w={"full"} target={"_blank"}>
                  <Box
                    p={4}
                    background={"white"}
                    _hover={{
                      background: "gray.200",
                      m: 1,
                    }}
                    borderRadius={20}
                  >
                    <AspectRatio ratio={1}>
                      <Image
                        src={sdk.imageUrl}
                        alt={sdk.name}
                        fit={"contain !important" as "contain"}
                      />
                    </AspectRatio>
                  </Box>
                  <Text w={"full"} mt={2} align={"center"} color={"white"}>
                    {sdk.name}
                  </Text>
                </Link>
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </Flex>
    </>
  );
};
