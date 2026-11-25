import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  workoutStreak: number;
}

export function StreakBadge({ workoutStreak }: StreakBadgeProps) {
  const hasStreak = workoutStreak > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl px-5 py-2",
        hasStreak ? "bg-streak/8" : "bg-secondary",
      )}
    >
      <Flame
        className={cn(
          "size-5",
          hasStreak
            ? "fill-streak text-streak"
            : "fill-muted-foreground text-muted-foreground",
        )}
      />
      <span className="text-base leading-[1.15] font-semibold">
        {workoutStreak}
      </span>
    </div>
  );
}
