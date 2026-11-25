import { Zap } from "lucide-react";

import { WEEK_DAY_LABELS, type WeekDay } from "@/app/_lib/week-days";

import { WeekDayBadge } from "./week-day-badge";

interface RestDayCardProps {
  weekDay: WeekDay;
}

export function RestDayCard({ weekDay }: RestDayCardProps) {
  return (
    <div className="bg-secondary border-border flex h-27.5 flex-col justify-between rounded-xl border p-5">
      <WeekDayBadge label={WEEK_DAY_LABELS[weekDay]} variant="muted" />
      <div className="flex items-center gap-2">
        <Zap className="fill-primary text-primary size-5" />
        <span className="text-2xl leading-[1.05] font-semibold">Descanso</span>
      </div>
    </div>
  );
}
