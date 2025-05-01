import { getOrgSubscriptions } from "@/app/actions/get-org-subscriptions";
import { ServerError } from "@/errors/server-error";
import type { Subscription } from "@/models/subscription";
import { useCallback, useState } from "react";

export const useOrgSubscriptions = ({ orgId }: { orgId: number }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>();
  const [error, setError] = useState<Error>();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getOrgSubscriptions({ orgId });
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setSubscriptions(response.value);
      setError(undefined);
    } catch (error: any) {
      setError(error);
    }
    setIsLoading(false);
  }, [orgId]);

  return {
    isLoading,
    subscriptions,
    error,
    refresh: () => {
      void fetchData();
    },
  };
};
