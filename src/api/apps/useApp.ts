import { App } from '@/models/app';
import ApiRoutes from '@/routes/apiRoutes';
import getFetcher from '@/util/fetcher';
import useSWR, { KeyedMutator } from 'swr';

export function useApp(
  orgId: number,
  appId: number,
): {
  app?: App;
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<App>;
} {
  const { data, isLoading, error, mutate } = useSWR<App>(
    ApiRoutes.getAppByOrgIdAndAppId(orgId, appId),
    getFetcher,
  );

  return {
    app: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
