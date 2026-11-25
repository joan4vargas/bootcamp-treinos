import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  role: "user" | "assistant";
  children: ReactNode;
}

export function ChatBubble({ role, children }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-xl p-3 text-sm leading-[1.4]",
        role === "user"
          ? "bg-primary text-primary-foreground self-end"
          : "bg-secondary text-foreground self-start",
      )}
    >
      {children}
    </div>
  );
}
