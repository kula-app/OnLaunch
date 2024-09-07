import { Product } from '@/models/product';
import ApiRoutes from '@/routes/apiRoutes';
import getFetcher from '@/util/fetcher';
import useSWR, { KeyedMutator } from 'swr';

export function useProducts(): {
  products?: Product[];
  isError?: Error;
  isLoading: boolean;
  mutate: KeyedMutator<Product[]>;
} {
  const { data, isLoading, error, mutate } = useSWR<Product[]>(
    ApiRoutes.PRODUCTS,
    getFetcher,
  );

  return {
    products: data,
    isError: error,
    isLoading: isLoading,
    mutate: mutate,
  };
}
