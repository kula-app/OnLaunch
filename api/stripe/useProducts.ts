import useSWR, { KeyedMutator } from "swr";
import ApiRoutes from "../../routes/apiRoutes";
import { User } from "../../models/user";
import getFetcher from "../../util/fetcher";
import { Product } from "../../models/product";

export function useProducts(): {
  products?: Product[];
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<Product[]>;
} {
  const { data, isLoading, error, mutate } = useSWR<Product[]>(
    ApiRoutes.PRODUCTS,
    getFetcher
  );

  return {
    products: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
