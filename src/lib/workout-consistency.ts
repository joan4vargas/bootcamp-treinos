import dayjs, { type Dayjs } from "dayjs";

import type { WeekDay } from "../generated/prisma/enums.js";
import { getWeekDay, listDatesBetween, toDateKey } from "./dates.js";

interface SessionRecord {
  startedAt: Date;
  completedAt: Date | null;
}

export interface DayConsistency {
  workoutDayCompleted: boolean;
  workoutDayStarted: boolean;
}

const MAX_STREAK_DAYS = 366;

export const buildConsistencyByDay = (
  sessions: SessionRecord[],
  from: Dayjs,
  to: Dayjs,
) => {
  const startedDates = new Set(
    sessions.map((session) => toDateKey(session.startedAt)),
  );
  const completedDates = new Set(
    sessions
      .filter((session) => session.completedAt !== null)
      .map((session) => toDateKey(session.startedAt)),
  );

  return Object.fromEntries(
    listDatesBetween(from, to).map((date) => {
      const dateKey = toDateKey(date);

      return [
        dateKey,
        {
          workoutDayCompleted: completedDates.has(dateKey),
          workoutDayStarted: startedDates.has(dateKey),
        },
      ];
    }),
  ) as Record<string, DayConsistency>;
};

export const calculateWorkoutStreak = (
  sessions: SessionRecord[],
  restWeekDays: WeekDay[],
  referenceDate: Dayjs,
) => {
  const completedDates = new Set(
    sessions
      .filter((session) => session.completedAt !== null)
      .map((session) => toDateKey(session.startedAt)),
  );
  const restWeekDaySet = new Set(restWeekDays);

  let streak = 0;
  let completedDaysInStreak = 0;

  for (let offset = 0; offset < MAX_STREAK_DAYS; offset++) {
    const date = referenceDate.subtract(offset, "day");
    const isCompleted = completedDates.has(toDateKey(date));
    const isRestDay = restWeekDaySet.has(getWeekDay(date));

    if (isCompleted) {
      streak++;
      completedDaysInStreak++;
      continue;
    }

    if (isRestDay) {
      streak++;
      continue;
    }

    if (offset === 0) {
      continue;
    }

    break;
  }

  return completedDaysInStreak === 0 ? 0 : streak;
};

export const getStreakWindowStart = (referenceDate: Dayjs) =>
  dayjs(referenceDate).subtract(MAX_STREAK_DAYS, "day").startOf("day");
