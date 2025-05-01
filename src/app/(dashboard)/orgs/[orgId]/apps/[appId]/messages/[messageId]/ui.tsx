"use client";

import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { MessageEditor } from "@/components/message-editor/message-editor";
import type { App } from "@/models/app";
import { Message } from "@/models/message";
import type { Org } from "@/models/org";
import { Flex } from "@chakra-ui/react";

export const UI: React.FC<{
  orgId: Org["id"];
  appId: App["id"];
  messageId: Message["id"];
}> = ({ orgId, appId, messageId }) => {
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
            { kind: "message", orgId, appId, messageId },
          ]}
        />
        <MessageEditor appId={appId} orgId={orgId} messageId={messageId} />
      </Flex>
    </>
  );
};
