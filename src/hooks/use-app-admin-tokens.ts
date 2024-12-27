import { getAppAdminTokens } from "@/app/actions/get-app-admin-tokens";
import { ServerError } from "@/errors/server-error";
import { AppAdminToken } from "@/models/app-admin-token";
import { useCallback, useEffect, useState } from "react";

export function useAppAdminTokens(appId: number): {
  tokens?: AppAdminToken[];
  error?: Error;
  isLoading: boolean;
  refresh: () => void;
} {
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<AppAdminToken[]>();
  const [error, setError] = useState<Error>();
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAppAdminTokens({ appId });
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setTokens(response.value);
      setError(undefined);
    } catch (error: any) {
      setError(error);
    }
    setIsLoading(false);
  }, [appId]);

  useEffect(() => {
    if (!tokens && !error) {
      fetchData();
    }
  }, [error, fetchData, tokens]);

  return {
    tokens: tokens,
    error: error,
    isLoading,
    refresh: () => {
      void fetchData();
    },
  };
}
