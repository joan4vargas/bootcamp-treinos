import dayjs from "dayjs";

import { getConsistencyStatus } from "@/app/_lib/consistency";
import { getWeekDates, toDateKey } from "@/app/_lib/dates";
import { WEEK_DAY_INITIALS } from "@/app/_lib/week-days";

import { ConsistencySquare } from "./consistency-square";

interface ConsistencyTrackerProps {
  consistencyByDay: Record<
    string,
    { workoutDayCompleted: boolean; workoutDayStarted: boolean }
  >;
}

export function ConsistencyTracker({
  consistencyByDay,
}: ConsistencyTrackerProps) {
  const today = dayjs();
  const weekDates = getWeekDates(today);

  return (
    <div className="border-border flex flex-1 items-center justify-between rounded-xl border p-5">
      {weekDates.map((date, index) => {
        const dateKey = toDateKey(date);

        return (
          <div key={dateKey} className="flex flex-col items-center gap-1.5">
            <ConsistencySquare
              className="size-5"
              status={getConsistencyStatus(consistencyByDay[dateKey])}
              isToday={date.isSame(today, "day")}
            />
            <span className="text-muted-foreground text-xs leading-[1.4]">
              {WEEK_DAY_INITIALS[index]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
