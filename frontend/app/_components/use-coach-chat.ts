"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";

export const useCoachChat = (chatId: string) => {
  const router = useRouter();

  return useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/ai`,
      credentials: "include",
    }),
    onFinish: () => router.refresh(),
  });
};
