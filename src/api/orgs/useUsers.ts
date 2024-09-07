import { User } from "@/models/user";
import ApiRoutes from "@/routes/apiRoutes";
import getFetcher from "@/util/fetcher";
import useSWR, { KeyedMutator } from "swr";

export function useUsers(orgId: number): {
  users?: User[];
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<User[]>;
} {
  const { data, isLoading, error, mutate } = useSWR<User[]>(
    ApiRoutes.getOrgUsersByOrgId(orgId),
    getFetcher,
  );

  return {
    users: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
