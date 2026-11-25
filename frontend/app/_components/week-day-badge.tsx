import { Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WeekDayBadgeProps {
  label: string;
  variant?: "glass" | "muted";
}

export function WeekDayBadge({ label, variant = "glass" }: WeekDayBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1 rounded-full px-2.5 text-xs leading-none font-semibold uppercase [&>svg]:size-3.5",
        variant === "glass" &&
          "border-overlay-foreground bg-overlay-foreground/16 text-overlay-foreground backdrop-blur-sm",
        variant === "muted" &&
          "border-overlay-foreground bg-foreground/8 text-foreground",
      )}
    >
      <Calendar />
      {label}
    </Badge>
  );
}
