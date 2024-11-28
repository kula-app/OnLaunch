import { getApps } from "@/app/actions/get-apps";
import { ServerError } from "@/errors/server-error";
import type { App } from "@/models/app";
import type { Org } from "@/models/org";
import { useCallback, useEffect, useState } from "react";

export const useApps = ({
  orgId,
}: {
  orgId: Org["id"];
}): {
  isLoading: boolean;
  apps: App[] | null;
  error: Error | null;
  refresh: () => void;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const [apps, setApps] = useState<App[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getApps(orgId);
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setApps(response.value);
      setError(null);
    } catch (error: any) {
      setError(error);
    }
    setIsLoading(false);
  }, [orgId]);
  useEffect(() => {
    if (!apps && !error) {
      fetchData();
    }
  }, [apps, error, fetchData]);

  return {
    isLoading: isLoading,
    apps: apps,
    error: error,
    refresh: () => {
      void fetchData();
    },
  };
};
