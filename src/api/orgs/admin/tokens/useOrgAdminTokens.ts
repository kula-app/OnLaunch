import { OrgAdminTokenDto } from "@/models/dtos/response/orgAdminTokenDto";
import ApiRoutes from "@/routes/apiRoutes";
import getFetcher from "@/util/fetcher";
import useSWR, { KeyedMutator } from "swr";

export function useOrgAdminTokens(orgId: number): {
  orgAdminTokens?: OrgAdminTokenDto[];
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<OrgAdminTokenDto[]>;
} {
  const { data, isLoading, error, mutate } = useSWR<OrgAdminTokenDto[]>(
    ApiRoutes.getOrgAdminTokensByOrgId(orgId),
    getFetcher,
  );

  return {
    orgAdminTokens: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
