import { getOrgAdminTokens } from "@/app/actions/get-org-admin-tokens";
import { ServerError } from "@/errors/server-error";
import { OrgAdminToken } from "@/models/org-admin-token";
import { useCallback, useEffect, useState } from "react";

export const useOrgAdminTokens = ({
  orgId,
}: {
  orgId: number;
}): {
  tokens?: OrgAdminToken[];
  error?: Error;
  isLoading: boolean;
  refresh: () => void;
} => {
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<OrgAdminToken[]>();
  const [error, setError] = useState<Error>();
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getOrgAdminTokens(orgId);
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setTokens(response.value);
      setError(undefined);
    } catch (error: any) {
      setError(error);
    }
    setIsLoading(false);
  }, [orgId]);

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
};
