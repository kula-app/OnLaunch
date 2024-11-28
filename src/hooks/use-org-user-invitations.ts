import { getOrgUserInvitations } from "@/app/actions/get-org-user-invitations";
import { ServerError } from "@/errors/server-error";
import type { Org } from "@/models/org";
import type { OrgUserInvitation } from "@/models/org-user-invitation";
import { useCallback, useEffect, useState } from "react";

export function useOrgUserInvitations({ orgId }: { orgId: Org["id"] }): {
  invitations?: OrgUserInvitation[];
  error?: Error;
  isLoading: boolean;
  refresh: () => void;
} {
  const [isLoading, setIsLoading] = useState(true);
  const [invitations, setInvitations] = useState<OrgUserInvitation[]>();
  const [error, setError] = useState<Error>();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getOrgUserInvitations({ orgId });
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setInvitations(response.value);
      setError(undefined);
    } catch (e: any) {
      setError(e);
    }
    setIsLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (!invitations && !error) {
      void fetchData();
    }
  }, [invitations, error, fetchData]);

  return {
    isLoading: isLoading,
    invitations: invitations,
    error: error,
    refresh: () => {
      void fetchData();
    },
  };
}
