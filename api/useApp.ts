import useSWR, { KeyedMutator } from 'swr';
import ApiRoutes from '../routes/apiRoutes';
import { App } from '../models/app';
import getFetcher from '../util/fetcher';

export function useApp(orgId: number, appId: number): {
    app?: App;
    isError?: Error;
    isLoading: boolean;
    mutate: KeyedMutator<App>;
} {
  const { data, isLoading, error, mutate } = useSWR<App>(ApiRoutes.getAppByOrgIdAndAppId(orgId, appId), getFetcher);

  return {
    app: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}