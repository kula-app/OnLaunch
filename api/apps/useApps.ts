import useSWR, { KeyedMutator } from "swr";
import ApiRoutes from "../../routes/apiRoutes";
import { App } from "../../models/app";
import getFetcher from "../../util/fetcher";

export function useApps(orgId: number): {
  apps?: App[];
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<App[]>;
} {
  const { data, isLoading, error, mutate } = useSWR<App[]>(
    ApiRoutes.getAppsByOrgId(orgId),
    getFetcher
  );

  return {
    apps: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
