import { getOrgUsers } from "@/app/actions/get-org-users";
import { ServerError } from "@/errors/server-error";
import { OrgUser } from "@/models/org-user";
import { useCallback, useEffect, useState } from "react";

export function useOrgUsers(orgId: number): {
  users?: OrgUser[];
  error?: Error;
  isLoading: boolean;
  refresh: () => void;
} {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<OrgUser[]>();
  const [error, setError] = useState<Error>();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getOrgUsers({ orgId });
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setUsers(response.value);
      setError(undefined);
    } catch (e: any) {
      setError(e);
    }
    setIsLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (!users && !error) {
      void fetchData();
    }
  }, [users, error, fetchData]);

  return {
    isLoading: isLoading,
    users: users,
    error: error,
    refresh: () => {
      void fetchData();
    },
  };
}
