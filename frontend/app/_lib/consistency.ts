export type ConsistencyStatus = "completed" | "started" | "none";

interface DayConsistency {
  workoutDayCompleted: boolean;
  workoutDayStarted: boolean;
}

export const getConsistencyStatus = (
  dayConsistency: DayConsistency | undefined,
): ConsistencyStatus => {
  if (dayConsistency?.workoutDayCompleted) {
    return "completed";
  }

  if (dayConsistency?.workoutDayStarted) {
    return "started";
  }

  return "none";
};
