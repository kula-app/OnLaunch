"use client";

import { Button, Heading, VStack } from "@chakra-ui/react";

export const ConclusionFormStep: React.FC = () => {
  return (
    <VStack w={"xl"}>
      <Heading size="lg" as="h1" color={"white"}>
        Your message is created! 🎉
      </Heading>
      <Button>Go back to messages</Button>
    </VStack>
  );
};
