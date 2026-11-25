import dayjs, { type Dayjs } from "dayjs";

import type { WeekDay } from "../generated/prisma/enums.js";

export const DATE_KEY_FORMAT = "YYYY-MM-DD";

const weekDaysByDayjsIndex: WeekDay[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export const toDateKey = (date: Date | Dayjs) =>
  dayjs(date).format(DATE_KEY_FORMAT);

export const getWeekDay = (date: Dayjs): WeekDay =>
  weekDaysByDayjsIndex[date.day()];

export const getStartOfWeek = (date: Dayjs) =>
  date.subtract((date.day() + 6) % 7, "day").startOf("day");

export const getEndOfWeek = (date: Dayjs) =>
  getStartOfWeek(date).add(6, "day").endOf("day");

export const listDatesBetween = (from: Dayjs, to: Dayjs) => {
  const dates: Dayjs[] = [];
  let current = from.startOf("day");

  while (!current.isAfter(to, "day")) {
    dates.push(current);
    current = current.add(1, "day");
  }

  return dates;
};
