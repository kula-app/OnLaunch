import { getAuthenticatedUserRoleInOrg } from "@/app/actions/get-authenticated-user-role-in-org";
import { ServerError } from "@/errors/server-error";
import type { Org } from "@/models/org";
import type { OrgRole } from "@/models/org-role";
import { useCallback, useEffect, useState } from "react";

export const useAuthenticatedUserRole = ({
  orgId,
}: {
  orgId: Org["id"];
}): {
  isLoading: boolean;
  role: OrgRole | null;
  error: Error | null;
  refresh: () => void;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setAuthenticatedUserRole] = useState<OrgRole | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const fetchAuthenticatedUserRole = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAuthenticatedUserRoleInOrg(orgId);
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setAuthenticatedUserRole(response.value);
      setError(null);
    } catch (error: any) {
      setError(error);
    }
    setIsLoading(false);
  }, [orgId]);
  useEffect(() => {
    if (!role) {
      fetchAuthenticatedUserRole();
    }
  }, [fetchAuthenticatedUserRole, role]);

  return {
    isLoading: isLoading,
    role: role,
    error: error,
    refresh: () => {
      void fetchAuthenticatedUserRole();
    },
  };
};
