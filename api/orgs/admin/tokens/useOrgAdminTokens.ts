import useSWR, { KeyedMutator } from "swr";
import { OrgAdminToken } from "../../../../models/orgAdminToken";
import ApiRoutes from "../../../../routes/apiRoutes";
import getFetcher from "../../../../util/fetcher";

export function useOrgAdminTokens(orgId: number): {
  orgAdminTokens?: OrgAdminToken[];
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<OrgAdminToken[]>;
} {
  const { data, isLoading, error, mutate } = useSWR<OrgAdminToken[]>(
    ApiRoutes.getOrgAdminTokensByOrgId(orgId),
    getFetcher
  );

  return {
    orgAdminTokens: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
