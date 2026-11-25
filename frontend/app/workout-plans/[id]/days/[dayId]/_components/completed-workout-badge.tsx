import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CompletedWorkoutBadge() {
  return (
    <Button
      variant="ghost"
      disabled
      className="text-overlay-foreground h-7.5 shrink-0 rounded-full px-4 text-sm leading-none font-semibold disabled:opacity-100"
    >
      <Check />
      Concluído
    </Button>
  );
}
