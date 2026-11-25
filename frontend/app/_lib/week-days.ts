export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export const WEEK_DAYS_ORDER: WeekDay[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export const WEEK_DAY_INITIALS = ["S", "T", "Q", "Q", "S", "S", "D"];

export const sortByWeekDay = <T extends { weekDay: WeekDay }>(items: T[]) =>
  [...items].sort(
    (first, second) =>
      WEEK_DAYS_ORDER.indexOf(first.weekDay) -
      WEEK_DAYS_ORDER.indexOf(second.weekDay),
  );
