import dayjs, { type Dayjs } from "dayjs";

export const DATE_KEY_FORMAT = "YYYY-MM-DD";

export const toDateKey = (date: Dayjs) => date.format(DATE_KEY_FORMAT);

export const getTodayDateKey = () => toDateKey(dayjs());

export const getStartOfWeek = (date: Dayjs) =>
  date.subtract((date.day() + 6) % 7, "day").startOf("day");

export const getWeekDates = (date: Dayjs) => {
  const startOfWeek = getStartOfWeek(date);

  return Array.from({ length: 7 }, (_, index) => startOfWeek.add(index, "day"));
};

export const isInCurrentWeek = (isoDate: string) => {
  const startOfWeek = getStartOfWeek(dayjs());
  const date = dayjs(isoDate);

  return (
    !date.isBefore(startOfWeek) && date.isBefore(startOfWeek.add(7, "day"))
  );
};
