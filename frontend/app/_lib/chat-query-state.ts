import { parseAsBoolean, parseAsString } from "nuqs";

export const chatQueryStateParsers = {
  chatOpen: parseAsBoolean,
  initialMessage: parseAsString,
};

export const buildExerciseQuestion = (exerciseName: string) =>
  `Como executar o exercício ${exerciseName} corretamente?`;
