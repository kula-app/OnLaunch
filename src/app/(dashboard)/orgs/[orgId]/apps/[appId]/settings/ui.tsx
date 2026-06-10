"use client";

import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { App } from "@/models/app";
import type { Org } from "@/models/org";
import { Routes } from "@/routes/routes";
import {
  Card,
  Container,
  Flex,
  Heading,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AppSettingsAdminAPI } from "./_components/app-settings-admin-api";
import { AppSettingsGeneral } from "./_components/app-settings-general";
import { AppSettingsSDKKeys } from "./_components/app-settings-sdk-keys";

enum SettingTab {
  GENERAL = "general",
  SDK_KEYS = "sdk-keys",
  ADMIN_API = "admin-api",
}

export const UI: React.FC<{
  orgId: Org["id"];
  appId: App["id"];
}> = ({ orgId, appId }) => {
  const router = useRouter();

  const orderedTabs: {
    id: SettingTab;
    name: string;
  }[] = useMemo(
    () => [
      {
        id: SettingTab.GENERAL,
        name: "General",
      },
      {
        id: SettingTab.SDK_KEYS,
        name: "SDK Keys",
      },
      {
        id: SettingTab.ADMIN_API,
        name: "Admin API",
      },
    ],
    [],
  );

  const [tabIndex, setTabIndex] = useState(0);
  const handleTabIndexChange = useCallback(
    (index: number) => {
      setTabIndex(index);
      router.replace(
        Routes.appSettings({ orgId, appId, tab: orderedTabs[index].id }),
      );
    },
    [appId, orderedTabs, orgId, router],
  );
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams?.get("tab");
    const tabIndex = orderedTabs.findIndex((t) => t.id === tab);
    if (tabIndex >= 0) {
      setTabIndex(tabIndex);
    } else {
      // If the tab is not found, default to the first tab
      handleTabIndexChange(0);
    }
  }, [handleTabIndexChange, orderedTabs, searchParams]);

  return (
    <>
      <Flex direction={"column"} minH={"100vh"}>
        <ConfiguredNavigationBar
          items={[
            { kind: "orgs" },
            { kind: "org", orgId },
            { kind: "apps", orgId },
            { kind: "app", orgId, appId },
            { kind: "app-settings", orgId, appId },
          ]}
        />
        <Container maxW={"6xl"}>
          <VStack w={"full"} gap={4}>
            <Heading size={"lg"} w={"full"} color={"white"} mt={4}>
              App Settings
            </Heading>
            <Card.Root w={"full"}>
              <Card.Body>
                <Tabs.Root
                  fitted
                  w={"full"}
                  colorPalette="brand"
                  defaultValue={SettingTab.GENERAL}
                >
                  <Tabs.List>
                    {orderedTabs.map((tab) => (
                      <Tabs.Trigger key={tab.id} value={tab.id}>
                        {tab.name}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>
                  {orderedTabs.map((tab) => (
                    <Tabs.Content key={tab.id} value={tab.id}>
                      {tab.id === SettingTab.GENERAL && (
                        <AppSettingsGeneral appId={appId} orgId={orgId} />
                      )}
                      {tab.id === SettingTab.SDK_KEYS && (
                        <AppSettingsSDKKeys appId={appId} />
                      )}
                      {tab.id === SettingTab.ADMIN_API && (
                        <AppSettingsAdminAPI appId={appId} />
                      )}
                    </Tabs.Content>
                  ))}
                </Tabs.Root>
              </Card.Body>
            </Card.Root>
          </VStack>
        </Container>
      </Flex>
    </>
  );
};
