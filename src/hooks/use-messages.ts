import { getMessages } from "@/app/actions/get-messages";
import { ServerError } from "@/errors/server-error";
import type { App } from "@/models/app";
import type { Message } from "@/models/message";
import { useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

export const useMessages = ({
  appId,
  filter,
}: {
  appId: App["id"];
  filter: "active" | "planned" | "past";
}) => {
  const toast = useToast();

  const [isLoading, setIsLoadingMessages] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const fetchMessages = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      const response = await getMessages(appId, filter);
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setMessages(response.value ?? null);
    } catch (error: any) {
      toast({
        title: "Failed to fetch messages",
        description: error.message,
        status: "error",
      });
    }
    setIsLoadingMessages(false);
  }, [appId, filter, toast]);
  useEffect(() => {
    if (!messages) {
      fetchMessages();
    }
  }, [fetchMessages, messages]);

  return {
    isLoading: isLoading,
    messages: messages,
    refresh: () => {
      void fetchMessages();
    },
  };
};
