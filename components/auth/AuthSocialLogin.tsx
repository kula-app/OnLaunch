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
import { AuthGradientBorder } from "./AuthGradientBorder";

export const AuthSocialLogin: React.FC<{}> = ({}) => {
  const toast = useToast();

  async function loginWithGitHub() {
    try {
      await signIn("github");
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
      await signIn("google");
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

  useEffect(
    () => {
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
    },
    [
      /* Keep this empty array, to run the effect exactly once */
    ]
  );

  /*
   * If no social login is enabled, do not render anything.
   * This will cause the component to show up delayed.
   */
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
            <AuthGradientBorder borderRadius="15px" onClick={loginWithGitHub}>
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
            </AuthGradientBorder>
          )}
          {isGoogleEnabled && (
            <AuthGradientBorder borderRadius="15px" onClick={loginWithGoogle}>
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
            </AuthGradientBorder>
          )}
        </HStack>
      </VStack>
    </>
  );
};
