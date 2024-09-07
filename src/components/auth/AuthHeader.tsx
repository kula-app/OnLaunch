import Routes from "@/routes/routes";
import { Link, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";

export const AuthHeader: React.FC = () => {
  return (
    <VStack
      width="100%"
      align={"start"}
      mb={"32px"}
      display={{ base: "solid", lg: "none" }}
    >
      <Link as={NextLink} href={Routes.DASHBOARD}>
        <Text
          fontSize="xl"
          color="white"
          fontWeight="medium"
          my={"16px"}
          mx={"16px"}
        >
          OnLaunch 🚀
        </Text>
      </Link>
    </VStack>
  );
};
