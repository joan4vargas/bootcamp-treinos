import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface ChatHeaderProps {
  action: ReactNode;
}

export function ChatHeader({ action }: ChatHeaderProps) {
  return (
    <header className="border-border flex items-center justify-between border-b p-5">
      <div className="flex items-center gap-2">
        <div className="bg-accent flex size-10.5 items-center justify-center rounded-full">
          <Sparkles className="text-primary size-4.5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-base leading-[1.05] font-semibold">
            Coach AI
          </span>
          <span className="text-primary flex items-center gap-1 text-xs leading-none">
            <span className="bg-online size-2 rounded-full" />
            Online
          </span>
        </div>
      </div>
      {action}
    </header>
  );
}
