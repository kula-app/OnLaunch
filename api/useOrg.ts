import useSWR, { KeyedMutator } from "swr";
import ApiRoutes from "../routes/apiRoutes";
import { Org } from "../models/org";
import getFetcher from "../util/fetcher";

export function useOrg(orgId: number): {
  org?: Org;
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<Org>;
} {
  const { data, isLoading, error, mutate } = useSWR<Org>(
    ApiRoutes.getOrgById(orgId),
    getFetcher
  );

  return {
    org: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
