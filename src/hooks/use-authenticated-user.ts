import { getUser } from "@/app/actions/get-user";
import { ServerError } from "@/errors/server-error";
import type { User } from "@/models/user";
import { useCallback, useEffect, useState } from "react";

export const useAuthenticatedUser = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUser();
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setUser(response.value);
      setError(null);
    } catch (error: any) {
      setError(error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user && !error) {
      fetchData();
    }
  }, [user, fetchData, error]);

  return {
    user,
    isLoading,
    error,
    refresh: () => {
      void fetchData();
    },
  };
};
