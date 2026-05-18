import { HStack, Link, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";

export const AuthFooter: React.FC = () => {
  return (
    <VStack w={"100%"} color="white">
      <HStack>
        <Link asChild><NextLink href="https://kula.app/terms" target="_blank">Terms of Service
                  </NextLink></Link>
        <Text>&middot;</Text>
        <Link asChild><NextLink href="https://kula.app/privacy" target="_blank">Privacy Policy
                  </NextLink></Link>
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
};
