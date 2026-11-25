"use client";

import type { UIMessage } from "ai";
import { type ReactNode, useEffect, useRef } from "react";

import { ChatBubble } from "./chat-bubble";
import { ChatHeader } from "./chat-header";
import { ChatInputForm } from "./chat-input-form";
import { ChatMessage } from "./chat-message";
import { ChatSuggestions } from "./chat-suggestions";
import { ChatTypingIndicator } from "./chat-typing-indicator";

interface ChatPanelProps {
  messages: UIMessage[];
  isLoading: boolean;
  hasError: boolean;
  welcomeMessages: string[];
  headerAction: ReactNode;
  showSuggestions?: boolean;
  onSendMessage: (message: string) => void;
}

export function ChatPanel({
  messages,
  isLoading,
  hasError,
  welcomeMessages,
  headerAction,
  showSuggestions = true,
  onSendMessage,
}: ChatPanelProps) {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="bg-background flex h-full flex-col overflow-hidden">
      <ChatHeader action={headerAction} />

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5 pb-10">
        {welcomeMessages.map((welcomeMessage) => (
          <ChatBubble key={welcomeMessage} role="assistant">
            {welcomeMessage}
          </ChatBubble>
        ))}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && <ChatTypingIndicator />}
        {hasError && (
          <p className="text-destructive text-sm">
            Não foi possível falar com o Coach AI. Tente novamente.
          </p>
        )}
        <div ref={scrollAnchorRef} />
      </div>

      <div className="flex flex-col gap-3">
        {showSuggestions && !hasMessages && (
          <ChatSuggestions onSelect={onSendMessage} />
        )}
        <ChatInputForm isDisabled={isLoading} onSubmit={onSendMessage} />
      </div>
    </div>
  );
}
