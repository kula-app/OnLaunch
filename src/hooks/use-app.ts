import { getApp } from "@/app/actions/get-app";
import { ServerError } from "@/errors/server-error";
import type { App } from "@/models/app";
import { useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

export const useApp = ({ appId }: { appId: App["id"] }) => {
  const toast = useToast();

  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [app, setApp] = useState<App | null>(null);
  const fetchApp = useCallback(async () => {
    setIsLoadingApp(true);
    try {
      const response = await getApp(appId);
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setApp(response.value);
    } catch (error: any) {
      toast({
        title: "Failed to fetch app",
        description: error.message,
        status: "error",
      });
    }
    setIsLoadingApp(false);
  }, [appId, toast, setApp, setIsLoadingApp]);
  useEffect(() => {
    if (!app) {
      fetchApp();
    }
  }, [fetchApp, app]);

  return {
    isLoading: isLoadingApp,
    app: app,
    refresh: () => {
      void fetchApp();
    },
  };
};
