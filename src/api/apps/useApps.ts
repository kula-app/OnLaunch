import { App } from "@/models/app";
import ApiRoutes from "@/routes/apiRoutes";
import getFetcher from "@/util/fetcher";
import useSWR, { KeyedMutator } from "swr";

export function useApps(orgId: number): {
  apps?: App[];
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<App[]>;
} {
  const { data, isLoading, error, mutate } = useSWR<App[]>(
    ApiRoutes.getAppsByOrgId(orgId),
    getFetcher,
  );

  return {
    apps: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
