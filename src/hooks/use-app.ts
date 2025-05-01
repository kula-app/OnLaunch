import { getApp } from "@/app/actions/get-app";
import { ServerError } from "@/errors/server-error";
import type { App } from "@/models/app";
import { useCallback, useEffect, useState } from "react";

export const useApp = ({
  appId,
}: {
  appId: App["id"];
}): {
  isLoading: boolean;
  app: App | null;
  error: Error | null;
  refresh: () => void;
} => {
  const [isLoading, setIsLoadingApp] = useState(false);
  const [app, setApp] = useState<App | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const fetchData = useCallback(async () => {
    setIsLoadingApp(true);
    try {
      const response = await getApp(appId);
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setApp(response.value);
      setError(null);
    } catch (error: any) {
      setError(error);
    }
    setIsLoadingApp(false);
  }, [appId, setApp, setIsLoadingApp]);
  useEffect(() => {
    if (!app && !error) {
      fetchData();
    }
  }, [fetchData, app, error]);

  return {
    isLoading: isLoading,
    app: app,
    error: error,
    refresh: () => {
      void fetchData();
    },
  };
};
