import type { ConsistencyStatus } from "@/app/_lib/consistency";
import { cn } from "@/lib/utils";

interface ConsistencySquareProps {
  status: ConsistencyStatus;
  isToday?: boolean;
  isFuture?: boolean;
  className?: string;
}

const STATUS_CLASS_NAMES: Record<ConsistencyStatus, string> = {
  completed: "bg-primary",
  started: "bg-primary-soft",
  none: "border border-border",
};

export function ConsistencySquare({
  status,
  isToday = false,
  isFuture = false,
  className,
}: ConsistencySquareProps) {
  return (
    <div
      className={cn(
        "rounded-md",
        STATUS_CLASS_NAMES[status],
        isFuture && "border-dashed",
        isToday && status === "none" && "border-primary border-[1.6px]",
        className,
      )}
    />
  );
}
