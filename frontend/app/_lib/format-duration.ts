const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;

export const formatDurationInMinutes = (seconds: number) =>
  `${Math.max(1, Math.round(seconds / SECONDS_IN_MINUTE))}min`;

export const formatTotalTime = (seconds: number) => {
  const totalMinutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  const hours = Math.floor(totalMinutes / MINUTES_IN_HOUR);
  const minutes = totalMinutes % MINUTES_IN_HOUR;

  return `${hours}h${minutes.toString().padStart(2, "0")}m`;
};

export const formatExercisesCount = (count: number) =>
  `${count} ${count === 1 ? "exercício" : "exercícios"}`;
