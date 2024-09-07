import { Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";

export const AuthLegalConsent: React.FC<{ action: "sign-in" | "sign-up" }> = ({
  action,
}) => {
  return (
    <Text color={"white"} fontSize={"xs"} textAlign={"center"} w={"full"}>
      By signing {action === "sign-in" && "in"}
      {action === "sign-up" && "up"}, you agree to our
      <br />
      <Link
        as={NextLink}
        href="https://kula.app/terms"
        target="_blank"
        style={{ textDecoration: "underline" }}
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        as={NextLink}
        href="https://kula.app/privacy"
        target="_blank"
        style={{ textDecoration: "underline" }}
      >
        Privacy Policy
      </Link>
    </Text>
  );
};
