import "dayjs/locale/pt-br";

import dayjs, { type Dayjs } from "dayjs";

import { getStartOfWeek } from "@/app/_lib/dates";

import { HeatmapMonth } from "./heatmap-month";

const DAYS_IN_WEEK = 7;

interface ConsistencyHeatmapProps {
  months: Dayjs[];
  consistencyByDay: Record<
    string,
    { workoutDayCompleted: boolean; workoutDayStarted: boolean }
  >;
}

const buildMonthWeeks = (month: Dayjs) => {
  const firstDay = month.startOf("month");
  const lastDay = month.endOf("month");
  const weeks: Array<Array<Dayjs | null>> = [];
  let weekStart = getStartOfWeek(firstDay);

  while (!weekStart.isAfter(lastDay, "day")) {
    const currentWeekStart = weekStart;

    weeks.push(
      Array.from({ length: DAYS_IN_WEEK }, (_, index) => {
        const date = currentWeekStart.add(index, "day");

        return date.isSame(month, "month") ? date : null;
      }),
    );
    weekStart = weekStart.add(DAYS_IN_WEEK, "day");
  }

  return weeks;
};

export function ConsistencyHeatmap({
  months,
  consistencyByDay,
}: ConsistencyHeatmapProps) {
  const today = dayjs();

  return (
    <div className="border-border flex w-full gap-3 rounded-xl border p-5">
      {months.map((month) => (
        <HeatmapMonth
          key={month.format("YYYY-MM")}
          label={month.locale("pt-br").format("MMM")}
          weeks={buildMonthWeeks(month)}
          today={today}
          consistencyByDay={consistencyByDay}
        />
      ))}
    </div>
  );
}
