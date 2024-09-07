import { Org } from '@/models/org';
import ApiRoutes from '@/routes/apiRoutes';
import getFetcher from '@/util/fetcher';
import useSWR, { KeyedMutator } from 'swr';

export function useOrg(orgId: number): {
  org?: Org;
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<Org>;
} {
  const { data, isLoading, error, mutate } = useSWR<Org>(
    ApiRoutes.getOrgById(orgId),
    getFetcher,
  );

  return {
    org: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
