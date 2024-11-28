import { getOrg } from "@/app/actions/get-org";
import { ServerError } from "@/errors/server-error";
import type { Org } from "@/models/org";
import { useCallback, useEffect, useState } from "react";

export const useOrg = ({
  orgId,
}: {
  orgId: Org["id"];
}): {
  org: Org | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
} => {
  const [isLoading, setIsLoading] = useState(true);
  const [org, setOrg] = useState<Org | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getOrg(orgId);
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setOrg(response.value);
      setError(null);
    } catch (error: any) {
      setError(error);
    }
    setIsLoading(false);
  }, [orgId]);
  useEffect(() => {
    if (!org && !error) {
      fetchData();
    }
  }, [org, fetchData, error]);

  return {
    org,
    isLoading,
    error,
    refresh: () => {
      void fetchData();
    },
  };
};
