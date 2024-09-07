import { requestAccountVerificationEmail } from "@/app/actions/request-account-verification-email";
import { useCooldown } from "@/hooks/useCooldown";
import { Box, Button, Heading, Text, useToast, VStack } from "@chakra-ui/react";
import { useState } from "react";

export const AuthVerificationEmailSent: React.FC<{
  email: string;
  isBackButtonVisible?: boolean;
  onBackButtonClick?: () => void;
}> = ({ email, isBackButtonVisible, onBackButtonClick }) => {
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const cooldown = useCooldown(60);

  async function resendVerificationEmail(email: string) {
    setIsLoading(true);
    try {
      await requestAccountVerificationEmail(email);
      cooldown.start();
    } catch (error: any) {
      toast({
        title: "Error while resending verification email",
        description: `${error.message}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
    setIsLoading(false);
  }

  return (
    <VStack color="white" textAlign={"center"} spacing={"24px"}>
      <Heading size="md">Please verify your email address to continue.</Heading>
      <Box>
        <Text>You&apos;re almost there! We sent an email to</Text>
        <Text>
          <strong>{email}</strong>
        </Text>
      </Box>
      <Box>
        <Text>
          Just click on the link that email to complete your signup. If you
          don&apos;t see the email, you may need to{" "}
          <strong>check your spam</strong> folder.
        </Text>
      </Box>
      <Box>
        <Text>Still didn&apos;t receive the email? No problem.</Text>
      </Box>
      <VStack spacing={"16px"} w="100%">
        <Button
          variant="brand"
          w="100%"
          minH="50"
          onClick={() => resendVerificationEmail(email)}
          isLoading={isLoading}
          isDisabled={cooldown.isActive}
        >
          Send Email Again {cooldown.isActive && `(${cooldown.seconds}s)`}
        </Button>
        {isBackButtonVisible && (
          <Button
            colorScheme="gray"
            w="100%"
            minH="50"
            onClick={onBackButtonClick}
          >
            Try Another Email
          </Button>
        )}
      </VStack>
    </VStack>
  );
};
