import type { Dayjs } from "dayjs";

import { ConsistencySquare } from "@/app/_components/consistency-square";
import { getConsistencyStatus } from "@/app/_lib/consistency";
import { toDateKey } from "@/app/_lib/dates";

interface HeatmapMonthProps {
  label: string;
  weeks: Array<Array<Dayjs | null>>;
  today: Dayjs;
  consistencyByDay: Record<
    string,
    { workoutDayCompleted: boolean; workoutDayStarted: boolean }
  >;
}

export function HeatmapMonth({
  label,
  weeks,
  today,
  consistencyByDay,
}: HeatmapMonthProps) {
  return (
    <div className="flex flex-col gap-1.5" style={{ flexGrow: weeks.length }}>
      <span className="text-muted-foreground text-xs leading-[1.4] capitalize">
        {label}
      </span>
      <div className="flex gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-1 flex-col gap-1">
            {week.map((date, dayIndex) =>
              date ? (
                <ConsistencySquare
                  key={toDateKey(date)}
                  className="aspect-square w-full rounded-sm"
                  status={getConsistencyStatus(
                    consistencyByDay[toDateKey(date)],
                  )}
                  isToday={date.isSame(today, "day")}
                  isFuture={date.isAfter(today, "day")}
                />
              ) : (
                <div key={dayIndex} className="aspect-square w-full" />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
