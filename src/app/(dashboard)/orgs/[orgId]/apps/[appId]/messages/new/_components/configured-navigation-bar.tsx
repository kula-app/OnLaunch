"use client";

import { getApp } from "@/app/actions/get-app";
import { getOrg } from "@/app/actions/get-org";
import { NavigationBar } from "@/components/navigation-bar";
import { ServerError } from "@/errors/server-error";
import type { App } from "@/models/app";
import type { Org } from "@/models/org";
import Routes from "@/routes/routes";
import { useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

export const ConfiguredNavigationBar: React.FC<{
  appId: number;
  orgId: number;
}> = ({ appId, orgId }) => {
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [appOrg, setAppOrg] = useState<
    | {
        app?: App;
        org?: Org;
      }
    | undefined
  >(undefined);
  const fetchOrgAndApp = useCallback(async () => {
    try {
      setIsLoading(true);

      const getOrgResponse = await getOrg(orgId);
      if (getOrgResponse.error) {
        throw new ServerError(
          getOrgResponse.error.name,
          getOrgResponse.error.message,
        );
      }

      const getAppResponse = await getApp(appId);
      if (!getAppResponse) {
        throw new ServerError("App not found", "App not found");
      }
      setAppOrg({
        org: getOrgResponse.value,
        app: getAppResponse.value,
      });
    } catch (error) {
      toast({
        title: "Failed to fetch app data",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [appId, orgId, toast]);

  useEffect(() => {
    if (!appOrg) {
      fetchOrgAndApp();
    }
  }, [appOrg, fetchOrgAndApp]);

  return (
    <NavigationBar
      isLoading={isLoading}
      pages={[
        {
          name: "Organizations",
          href: Routes.orgs,
        },
        {
          name: appOrg?.org?.name ?? "Organization",
          href: Routes.org({ orgId }),
        },
        {
          name: "Apps",
          href: Routes.apps({ orgId }),
        },
        {
          name: appOrg?.app?.name ?? "App",
          href: Routes.app({ orgId, appId }),
        },
        {
          name: "Messages",
          href: Routes.messages({ orgId, appId }),
        },
        {
          name: "Create",
          href: Routes.createMessage({ orgId, appId }),
          isActive: true,
        },
      ]}
    />
  );
};
