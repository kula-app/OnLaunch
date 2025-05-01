import { getOrgs } from "@/app/actions/get-orgs";
import { ServerError } from "@/errors/server-error";
import type { Org } from "@/models/org";
import { useCallback, useEffect, useState } from "react";

export const useOrgs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgs, setOrgs] = useState<Org[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getOrgs();
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setOrgs(response.value);
      setError(null);
    } catch (error: any) {
      setError(error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!orgs && !error) {
      fetchData();
    }
  }, [fetchData, orgs, error]);

  return {
    isLoading: isLoading,
    orgs: orgs,
    error: error,
    refresh: () => {
      void fetchData();
    },
  };
};
