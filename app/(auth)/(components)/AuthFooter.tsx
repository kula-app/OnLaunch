import { HStack, Link, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";

function AuthFooter() {
  return (
    <VStack w={"100%"} color="white">
      <HStack>
        <Link as={NextLink} href="https://kula.app/terms" target="_blank">
          Terms of Service
        </Link>
        <Text>&middot;</Text>
        <Link as={NextLink} href="https://kula.app/privacy" target="_blank">
          Privacy Policy
        </Link>
      </HStack>
      <Text
        textAlign={{
          base: "center",
        }}
        fontSize={"12px"}
      >
        &copy; {new Date().getFullYear()} &middot; created with ❤️ by{" "}
        <Link href="https://kula.app" target="_blank">
          {"kula.app"}
        </Link>
      </Text>
    </VStack>
  );
}

export default AuthFooter;
