import type { Prisma } from "../generated/prisma/client.js";
import type { WeekDay } from "../generated/prisma/enums.js";

export const workoutPlanInclude = {
  workoutDays: {
    include: {
      exercises: {
        orderBy: {
          order: "asc",
        },
      },
    },
  },
} satisfies Prisma.WorkoutPlanInclude;

export const workoutDayInclude = {
  exercises: {
    orderBy: {
      order: "asc",
    },
  },
} satisfies Prisma.WorkoutDayInclude;

interface WorkoutExerciseRecord {
  id: string;
  name: string;
  order: number;
  workoutDayId: string;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkoutDayRecord {
  id: string;
  name: string;
  workoutPlanId: string;
  isRest: boolean;
  weekDay: WeekDay;
  coverImageUrl: string | null;
  exercises: WorkoutExerciseRecord[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkoutPlanRecord {
  id: string;
  name: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  workoutDays: WorkoutDayRecord[];
}

export interface WorkoutExerciseDto {
  id: string;
  name: string;
  order: number;
  workoutDayId: string;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutDayDto {
  id: string;
  name: string;
  workoutPlanId: string;
  isRest: boolean;
  weekDay: WeekDay;
  coverImageUrl: string | null;
  estimatedDurationInSeconds: number;
  exercises: WorkoutExerciseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlanDto {
  id: string;
  name: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  workoutDays: WorkoutDayDto[];
}

const SECONDS_PER_REP = 4;

interface WorkoutSessionRecord {
  id: string;
  workoutDayId: string;
  startedAt: Date;
  completedAt: Date | null;
}

export interface WorkoutSessionDto {
  id: string;
  workoutDayId: string;
  startedAt: string;
  completedAt: string | null;
}

export const estimateWorkoutDayDurationInSeconds = (
  exercises: Array<
    Pick<WorkoutExerciseRecord, "sets" | "reps" | "restTimeInSeconds">
  >,
) =>
  exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets *
        (exercise.reps * SECONDS_PER_REP + exercise.restTimeInSeconds),
    0,
  );

export const toWorkoutSessionDto = (
  session: WorkoutSessionRecord,
): WorkoutSessionDto => ({
  id: session.id,
  workoutDayId: session.workoutDayId,
  startedAt: session.startedAt.toISOString(),
  completedAt: session.completedAt?.toISOString() ?? null,
});

export const toWorkoutExerciseDto = (
  exercise: WorkoutExerciseRecord,
): WorkoutExerciseDto => ({
  id: exercise.id,
  name: exercise.name,
  order: exercise.order,
  workoutDayId: exercise.workoutDayId,
  sets: exercise.sets,
  reps: exercise.reps,
  restTimeInSeconds: exercise.restTimeInSeconds,
  createdAt: exercise.createdAt.toISOString(),
  updatedAt: exercise.updatedAt.toISOString(),
});

export const toWorkoutDayDto = (day: WorkoutDayRecord): WorkoutDayDto => ({
  id: day.id,
  name: day.name,
  workoutPlanId: day.workoutPlanId,
  isRest: day.isRest,
  weekDay: day.weekDay,
  coverImageUrl: day.coverImageUrl,
  estimatedDurationInSeconds: estimateWorkoutDayDurationInSeconds(
    day.exercises,
  ),
  exercises: day.exercises.map(toWorkoutExerciseDto),
  createdAt: day.createdAt.toISOString(),
  updatedAt: day.updatedAt.toISOString(),
});

export const toWorkoutPlanDto = (plan: WorkoutPlanRecord): WorkoutPlanDto => ({
  id: plan.id,
  name: plan.name,
  userId: plan.userId,
  isActive: plan.isActive,
  createdAt: plan.createdAt.toISOString(),
  updatedAt: plan.updatedAt.toISOString(),
  workoutDays: plan.workoutDays.map(toWorkoutDayDto),
});
