import { getMessages } from "@/app/actions/get-messages";
import { ServerError } from "@/errors/server-error";
import type { App } from "@/models/app";
import type { Message } from "@/models/message";
import { useCallback, useEffect, useState } from "react";

export const useMessages = ({
  appId,
  filter,
}: {
  appId: App["id"];
  filter: "active" | "planned" | "past";
}): {
  isLoading: boolean;
  messages: Message[] | null;
  error: Error | null;
  refresh: () => void;
} => {
  const [isLoading, setIsLoadingMessages] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      const response = await getMessages(appId, filter);
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setMessages(response.value);
      setError(null);
    } catch (error: any) {
      setError(error);
    }
    setIsLoadingMessages(false);
  }, [appId, filter]);
  useEffect(() => {
    if (!messages) {
      fetchData();
    }
  }, [fetchData, messages]);

  return {
    isLoading: isLoading,
    messages: messages,
    error: error,
    refresh: () => {
      void fetchData();
    },
  };
};
