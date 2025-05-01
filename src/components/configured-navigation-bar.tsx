"use client";

import { getApp } from "@/app/actions/get-app";
import { getOrg } from "@/app/actions/get-org";
import {
  NavigationBar,
  type NavigationBarItem,
} from "@/components/navigation-bar";
import { ServerError } from "@/errors/server-error";
import type { App } from "@/models/app";
import type { Message } from "@/models/message";
import type { Org } from "@/models/org";
import { Routes } from "@/routes/routes";
import { useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

export type ConfiguredNavigationBarItem =
  | {
      kind: "orgs";
    }
  | {
      kind: "org";
      orgId: Org["id"];
    }
  | {
      kind: "org-settings";
      orgId: Org["id"];
    }
  | {
      kind: "create-org";
    }
  | {
      kind: "upgrade-org";
      orgId: Org["id"];
    }
  | {
      kind: "apps";
      orgId: Org["id"];
    }
  | {
      kind: "app";
      orgId: Org["id"];
      appId: App["id"];
    }
  | {
      kind: "app-settings";
      orgId: Org["id"];
      appId: App["id"];
    }
  | {
      kind: "create-app";
      orgId: Org["id"];
    }
  | {
      kind: "messages";
      orgId: Org["id"];
      appId: App["id"];
    }
  | {
      kind: "message";
      orgId: Org["id"];
      appId: App["id"];
      messageId: Message["id"];
    }
  | {
      kind: "create-message";
      orgId: Org["id"];
      appId: App["id"];
    }
  | {
      kind: "profile";
    };

export const ConfiguredNavigationBar: React.FC<{
  items: ConfiguredNavigationBarItem[];
}> = ({ items }) => {
  const toast = useToast();

  const [isLoadingOrg, setIsLoadingOrg] = useState(false);
  const [org, setOrg] = useState<Org | null>(null);
  const [orgError, setOrgError] = useState<Error | null>(null);
  const fetchOrg = useCallback(
    async (orgId: number) => {
      setIsLoadingOrg(true);
      try {
        const response = await getOrg(orgId);
        if (!response.success) {
          throw new ServerError(response.error.name, response.error.message);
        }
        setOrg(response.value);
        setOrgError(null);
      } catch (error: any) {
        setOrgError(error);
        toast({
          title: "Failed to fetch organization",
          description: error.message,
          status: "error",
        });
      }
      setIsLoadingOrg(false);
    },
    [toast, setOrg],
  );

  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [app, setApp] = useState<App | null>(null);
  const [appError, setAppError] = useState<Error | null>(null);
  const fetchApp = useCallback(
    async (appId: number) => {
      setIsLoadingApp(true);
      try {
        const response = await getApp(appId);
        if (!response.success) {
          throw new ServerError(response.error.name, response.error.message);
        }
        setApp(response.value);
        setAppError(null);
      } catch (error: any) {
        setAppError(error);
        toast({
          title: "Failed to fetch app",
          description: error.message,
          status: "error",
        });
      }
      setIsLoadingApp(false);
    },
    [toast, setApp],
  );

  const [navigationItems, setNavigationItems] = useState<NavigationBarItem[]>();
  useEffect(() => {
    const updatedNavigationItems: NavigationBarItem[] = [];
    for (const item of items) {
      switch (item.kind) {
        case "orgs": {
          updatedNavigationItems.push({
            name: "Organizations",
            href: Routes.organizations,
          });
          break;
        }
        case "org": {
          if (!org && !orgError) {
            fetchOrg(item.orgId);
          }
          updatedNavigationItems.push({
            name: org?.name ?? "Organization",
            isLoading: isLoadingOrg,
            href: Routes.organization({
              orgId: item.orgId,
            }),
          });
          break;
        }
        case "org-settings": {
          updatedNavigationItems.push({
            name: "Settings",
            href: Routes.organizationSettings({
              orgId: item.orgId,
            }),
          });
          break;
        }
        case "create-org": {
          updatedNavigationItems.push({
            name: "Create",
            href: Routes.createOrganization,
          });
          break;
        }
        case "apps": {
          updatedNavigationItems.push({
            name: "Apps",
            href: Routes.apps({
              orgId: item.orgId,
            }),
          });
          break;
        }
        case "app": {
          if (!app && !appError) {
            fetchApp(item.appId);
          }
          updatedNavigationItems.push({
            name: app?.name ?? "App",
            isLoading: isLoadingApp,
            href: Routes.app({
              orgId: item.orgId,
              appId: item.appId,
            }),
          });
          break;
        }
        case "app-settings": {
          updatedNavigationItems.push({
            name: "Settings",
            href: Routes.appSettings({
              orgId: item.orgId,
              appId: item.appId,
            }),
          });
          break;
        }
        case "create-app": {
          updatedNavigationItems.push({
            name: "Create",
            href: Routes.createApp({
              orgId: item.orgId,
            }),
          });
          break;
        }
        case "messages": {
          updatedNavigationItems.push({
            name: "Messages",
            href: Routes.messages({
              orgId: item.orgId,
              appId: item.appId,
            }),
          });
          break;
        }
        case "message": {
          updatedNavigationItems.push({
            name: "Edit",
            href: Routes.message({
              orgId: item.orgId,
              appId: item.appId,
              messageId: item.messageId,
            }),
          });
          break;
        }
        case "create-message": {
          updatedNavigationItems.push({
            name: "Create",
            href: Routes.createMessage({
              orgId: item.orgId,
              appId: item.appId,
            }),
          });
          break;
        }
        case "profile": {
          updatedNavigationItems.push({
            name: "Profile",
            href: Routes.profile,
          });
          break;
        }
      }
    }
    setNavigationItems(updatedNavigationItems);
  }, [
    fetchOrg,
    org,
    isLoadingOrg,
    fetchApp,
    app,
    isLoadingApp,
    items,
    setNavigationItems,
    orgError,
    appError,
  ]);

  return <NavigationBar items={navigationItems} />;
};
