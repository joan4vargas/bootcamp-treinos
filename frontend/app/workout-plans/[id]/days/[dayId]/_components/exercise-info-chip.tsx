import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

interface ExerciseInfoChipProps {
  children: ReactNode;
}

export function ExerciseInfoChip({ children }: ExerciseInfoChipProps) {
  return (
    <Badge
      variant="secondary"
      className="text-muted-foreground h-5.5 gap-1 rounded-full px-2.5 text-xs leading-none font-semibold [&>svg]:size-3.5"
    >
      {children}
    </Badge>
  );
}
