import { AppAdminTokenDto } from '@/models/dtos/response/appAdminTokenDto';
import ApiRoutes from '@/routes/apiRoutes';
import getFetcher from '@/util/fetcher';
import useSWR, { KeyedMutator } from 'swr';

export function useAppAdminTokens(
  orgId: number,
  appId: number,
): {
  appAdminTokens?: AppAdminTokenDto[];
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<AppAdminTokenDto[]>;
} {
  const { data, isLoading, error, mutate } = useSWR<AppAdminTokenDto[]>(
    ApiRoutes.getAppAdminTokensByOrgIdAndAppId(orgId, appId),
    getFetcher,
  );

  return {
    appAdminTokens: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
