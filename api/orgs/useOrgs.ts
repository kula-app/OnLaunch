import useSWR, { KeyedMutator } from "swr";
import ApiRoutes from "../../routes/apiRoutes";
import { Org } from "../../models/org";
import getFetcher from "../../util/fetcher";

export function useOrgs(): {
  orgs?: Org[];
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<Org[]>;
} {
  const { data, isLoading, error, mutate } = useSWR<Org[]>(
    ApiRoutes.ORGS,
    getFetcher
  );

  return {
    orgs: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
