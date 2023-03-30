import useSWR, { KeyedMutator } from 'swr';
import ApiRoutes from '../routes/apiRoutes';
import { User } from '../types/user';
import getFetcher from '../util/fetcher';

export function useUsers(orgId: number): {
    users?: User[];
    isError?: Error;
    isLoading: boolean;
    mutate: KeyedMutator<User[]>;
} {
  const { data, isLoading, error, mutate } = useSWR<User[]>(ApiRoutes.getAppsByOrgId, getFetcher);

  return {
    users: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}