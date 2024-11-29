"use client";

import type { App } from "@/models/app";
import type { Org } from "@/models/org";
import Routes from "@/routes/routes";
import { Button, Heading, VStack, type BoxProps } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export const ConclusionFormStep: React.FC<
  BoxProps & {
    appId: App["id"];
    orgId: Org["id"];
  }
> = ({ appId, orgId, ...props }) => {
  const router = useRouter();

  return (
    <VStack w={"xl"} {...props}>
      <Heading size="lg" as="h1" color={"white"}>
        Your message is created! 🎉
      </Heading>
      <Button
        onClick={() => {
          router.push(
            Routes.messages({
              orgId: orgId,
              appId: appId,
            }),
          );
        }}
      >
        Go back to messages
      </Button>
    </VStack>
  );
};
