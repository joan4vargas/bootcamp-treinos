"use client";

import { Sparkles } from "lucide-react";
import { useQueryStates } from "nuqs";

import { chatQueryStateParsers } from "@/app/_lib/chat-query-state";
import { Button } from "@/components/ui/button";

export function ChatOpenButton() {
  const [, setChatState] = useQueryStates(chatQueryStateParsers);

  return (
    <Button
      size="icon"
      aria-label="Abrir Coach AI"
      className="size-14 rounded-full [&_svg:not([class*='size-'])]:size-6"
      onClick={() => setChatState({ chatOpen: true, initialMessage: null })}
    >
      <Sparkles />
    </Button>
  );
}
