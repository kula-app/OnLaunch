import {
  Divider,
  Flex,
  HStack,
  Icon,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa6";
import GradientBorder from "./GradientBorder";

export const AuthSocialLogin: React.FC<{}> = ({}) => {
  const toast = useToast();

  async function loginWithGitHub() {
    try {
      const result = await signIn("github");
      console.log(result);
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  }

  async function loginWithGoogle() {
    try {
      const result = await signIn("google");
      console.log(result);
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  }

  const [isSocialLoginEnabled, setIsSocialLoginEnabled] = useState(false);
  const [isGitHubEnabled, setIsGitHubEnabled] = useState(false);
  const [isGoogleEnabled, setIsGoogleEnabled] = useState(false);

  useEffect(() => {
    async function fetchProviders() {
      const providers = await getProviders();
      if (providers?.github) {
        setIsSocialLoginEnabled(true);
        setIsGitHubEnabled(true);
      }
      if (providers?.google) {
        setIsSocialLoginEnabled(true);
        setIsGoogleEnabled(true);
      }
    }

    fetchProviders();
  });

  if (!isSocialLoginEnabled) {
    return null;
  }

  return (
    <>
      <VStack w={"full"} spacing={"16px"}>
        <HStack w={"full"}>
          <Divider />
          <Text color={"white"} fontSize={"xs"} textAlign={"center"} w={"full"}>
            Or continue with
          </Text>
          <Divider />
        </HStack>
        <HStack spacing="15px" justify="center">
          {isGitHubEnabled && (
            <GradientBorder borderRadius="15px" onClick={loginWithGitHub}>
              <Flex
                _hover={{ filter: "brightness(150%)" }}
                transition="all .25s ease"
                cursor="pointer"
                justify="center"
                align="center"
                background="#131538"
                w="65px"
                h="65px"
                borderRadius="15px"
              >
                <Icon
                  color={"white"}
                  as={FaGithub}
                  w="30px"
                  h="30px"
                  _hover={{ filter: "brightness(150%)" }}
                />
              </Flex>
            </GradientBorder>
          )}
          {isGoogleEnabled && (
            <GradientBorder borderRadius="15px" onClick={loginWithGoogle}>
              <Flex
                _hover={{ filter: "brightness(150%)" }}
                transition="all .25s ease"
                cursor="pointer"
                justify="center"
                align="center"
                bg="rgb(19,21,54)"
                w="65px"
                h="65px"
                borderRadius="15px"
              >
                <Icon
                  color={"white"}
                  as={FaGoogle}
                  w="30px"
                  h="30px"
                  _hover={{ filter: "brightness(150%)" }}
                />
              </Flex>
            </GradientBorder>
          )}
        </HStack>
      </VStack>
    </>
  );
};
