"use client";

import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { MessageEditor } from "@/components/message-editor/message-editor";
import { Flex } from "@chakra-ui/react";
import type React from "react";

interface Props {
  orgId: number;
  appId: number;
}

export const UI: React.FC<Props> = ({ orgId, appId }) => {
  return (
    <>
      <Flex
        direction={"column"}
        align={"stretch"}
        minH={{ base: 0, sm: "100vh" }}
      >
        <ConfiguredNavigationBar
          items={[
            { kind: "orgs" },
            { kind: "org", orgId },
            { kind: "apps", orgId },
            { kind: "app", orgId, appId },
            { kind: "messages", orgId, appId },
            { kind: "create-message", orgId, appId },
          ]}
        />
        <MessageEditor appId={appId} orgId={orgId} messageId={undefined} />
      </Flex>
    </>
  );
};
