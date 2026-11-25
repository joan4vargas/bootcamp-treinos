import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-primary/8 flex flex-col items-center gap-5 rounded-xl p-5",
        className,
      )}
    >
      <div className="bg-primary/8 flex size-8.5 items-center justify-center rounded-full">
        <Icon className="text-primary size-4" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-2xl leading-[1.15] font-semibold">{value}</span>
        <span className="text-muted-foreground text-xs leading-[1.4]">
          {label}
        </span>
      </div>
    </div>
  );
}
