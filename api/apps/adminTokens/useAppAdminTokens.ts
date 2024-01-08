import useSWR, { KeyedMutator } from "swr";
import { AppAdminToken } from "../../../models/appAdminToken";
import ApiRoutes from "../../../routes/apiRoutes";
import getFetcher from "../../../util/fetcher";

export function useAppAdminTokens(
  orgId: number,
  appId: number
): {
  appAdminTokens?: AppAdminToken[];
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<AppAdminToken[]>;
} {
  const { data, isLoading, error, mutate } = useSWR<AppAdminToken[]>(
    ApiRoutes.getAppAdminTokensByOrgIdAndAppId(orgId, appId),
    getFetcher
  );

  return {
    appAdminTokens: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
