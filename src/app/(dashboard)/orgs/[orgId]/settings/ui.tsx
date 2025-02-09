"use client";

import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { Routes } from "@/routes/routes";
import {
  Card,
  CardBody,
  Container,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { OrgSettingsAdminAPI } from "./_components/org-settings-admin-api";
import { OrgSettingsBilling } from "./_components/org-settings-billing";
import { OrgSettingsGeneral } from "./_components/org-settings-general";
import { OrgSettingsUsers } from "./_components/org-settings-users";

enum SettingTab {
  GENERAL = "general",
  BILLING = "billing",
  USERS = "users",
  ADMIN_API = "admin-api",
}

export const UI: React.FC<{
  orgId: number;
  isBillingAvailable: boolean;
}> = ({ orgId, isBillingAvailable }) => {
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
      ...(isBillingAvailable
        ? [
            {
              id: SettingTab.BILLING,
              name: "Billing",
            },
          ]
        : []),
      {
        id: SettingTab.USERS,
        name: "Users",
      },
      {
        id: SettingTab.ADMIN_API,
        name: "Admin API",
      },
    ],
    [isBillingAvailable],
  );

  const [tabIndex, setTabIndex] = useState(0);
  const handleTabIndexChange = useCallback(
    (index: number) => {
      setTabIndex(index);
      router.replace(
        Routes.organizationSettings({
          orgId,
          tab: orderedTabs[index].id,
        }),
      );
    },
    [orgId, orderedTabs, router],
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
    <Flex direction={"column"} minH={"100vh"}>
      <ConfiguredNavigationBar
        items={[
          { kind: "orgs" },
          { kind: "org", orgId },
          { kind: "org-settings", orgId },
        ]}
      />
      <Container maxW={"6xl"}>
        <VStack gap={4} w={"full"}>
          <Heading size={"lg"} w={"full"} color={"white"} mt={4}>
            Organisation Settings
          </Heading>
          <Card w={"full"}>
            <CardBody>
              <Tabs
                isFitted
                w={"full"}
                variant={"brand-on-card"}
                colorScheme="brand"
                index={tabIndex}
                onChange={handleTabIndexChange}
              >
                <TabList>
                  {orderedTabs.map((tab) => (
                    <Tab key={tab.id}>{tab.name}</Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {orderedTabs.map((tab) => (
                    <TabPanel key={tab.id}>
                      {tab.id === SettingTab.GENERAL && (
                        <OrgSettingsGeneral orgId={orgId} />
                      )}
                      {tab.id === SettingTab.BILLING && (
                        <OrgSettingsBilling orgId={orgId} />
                      )}
                      {tab.id === SettingTab.USERS && (
                        <OrgSettingsUsers orgId={orgId} />
                      )}
                      {tab.id === SettingTab.ADMIN_API && (
                        <OrgSettingsAdminAPI orgId={orgId} />
                      )}
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Flex>
  );
};
