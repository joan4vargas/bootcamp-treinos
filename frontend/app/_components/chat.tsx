"use client";

import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect } from "react";

import { chatQueryStateParsers } from "@/app/_lib/chat-query-state";
import { Button } from "@/components/ui/button";

import { ChatPanel } from "./chat-panel";
import { useCoachChat } from "./use-coach-chat";

const WELCOME_MESSAGES = [
  "Olá! Sou sua IA personal. Como posso ajudar com seu treino hoje?",
];

export function Chat() {
  const [{ chatOpen, initialMessage }, setChatState] = useQueryStates(
    chatQueryStateParsers,
  );
  const { messages, sendMessage, status, error } = useCoachChat("coach-chat");
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!chatOpen || !initialMessage || isLoading) {
      return;
    }

    sendMessage({ text: initialMessage });
    setChatState({ initialMessage: null });
  }, [chatOpen, initialMessage, isLoading, sendMessage, setChatState]);

  if (!chatOpen) {
    return null;
  }

  const closeChat = () =>
    setChatState({ chatOpen: null, initialMessage: null });

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-md">
      <button
        type="button"
        aria-label="Fechar chat"
        className="bg-overlay/30 absolute inset-0 backdrop-blur-[2px]"
        onClick={closeChat}
      />
      <div className="absolute inset-x-4 top-40 bottom-4 overflow-hidden rounded-[20px]">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          hasError={!!error}
          welcomeMessages={WELCOME_MESSAGES}
          onSendMessage={(text) => sendMessage({ text })}
          headerAction={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar chat"
              className="text-muted-foreground"
              onClick={closeChat}
            >
              <X className="size-6" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
