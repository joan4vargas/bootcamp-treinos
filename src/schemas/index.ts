import z from "zod/v4";

import { WeekDay } from "../generated/prisma/enums.js";

export const weekDaySchema = z.enum(WeekDay);

export const workoutExerciseInputSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().positive(),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  restTimeInSeconds: z.number().int().nonnegative(),
});

export const workoutDayInputSchema = z.object({
  name: z.string().min(1),
  weekDay: weekDaySchema,
  isRest: z.boolean().default(false),
  coverImageUrl: z.url().optional(),
  exercises: z.array(workoutExerciseInputSchema).default([]),
});

export const createWorkoutPlanBodySchema = z.object({
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  workoutDays: z.array(workoutDayInputSchema).min(1),
});

export const updateWorkoutPlanBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.name !== undefined || data.isActive !== undefined, {
    message: "At least one field must be provided",
  });

export const listWorkoutPlansQuerySchema = z.object({
  isActive: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const updateWorkoutDayBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    weekDay: weekDaySchema.optional(),
    isRest: z.boolean().optional(),
    coverImageUrl: z.url().nullable().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.weekDay !== undefined ||
      data.isRest !== undefined ||
      data.coverImageUrl !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

export const updateWorkoutExerciseBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    order: z.number().int().positive().optional(),
    sets: z.number().int().positive().optional(),
    reps: z.number().int().positive().optional(),
    restTimeInSeconds: z.number().int().nonnegative().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.order !== undefined ||
      data.sets !== undefined ||
      data.reps !== undefined ||
      data.restTimeInSeconds !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

export const idParamsSchema = z.object({
  id: z.uuid(),
});

export const planParamsSchema = z.object({
  planId: z.uuid(),
});

export const dayParamsSchema = z.object({
  planId: z.uuid(),
  dayId: z.uuid(),
});

export const exerciseParamsSchema = z.object({
  planId: z.uuid(),
  dayId: z.uuid(),
  exerciseId: z.uuid(),
});

export const workoutExerciseResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number().int(),
  workoutDayId: z.string(),
  sets: z.number().int(),
  reps: z.number().int(),
  restTimeInSeconds: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const workoutDayResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  workoutPlanId: z.string(),
  isRest: z.boolean(),
  weekDay: weekDaySchema,
  coverImageUrl: z.string().nullable(),
  estimatedDurationInSeconds: z.number().int(),
  exercises: z.array(workoutExerciseResponseSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const workoutPlanResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  workoutDays: z.array(workoutDayResponseSchema),
});

export const sessionParamsSchema = z.object({
  planId: z.uuid(),
  dayId: z.uuid(),
  sessionId: z.uuid(),
});

export const workoutSessionResponseSchema = z.object({
  id: z.string(),
  workoutDayId: z.string(),
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime().nullable(),
});

export const getWorkoutDayResponseSchema = workoutDayResponseSchema.extend({
  sessions: z.array(workoutSessionResponseSchema),
});

export const updateWorkoutSessionBodySchema = z.object({
  completedAt: z.iso.datetime(),
});

export const dayConsistencySchema = z.object({
  workoutDayCompleted: z.boolean(),
  workoutDayStarted: z.boolean(),
});

export const consistencyByDaySchema = z.record(
  z.string(),
  dayConsistencySchema,
);

export const homeParamsSchema = z.object({
  date: z.iso.date(),
});

export const homeDataResponseSchema = z.object({
  activeWorkoutPlanId: z.string().optional(),
  todayWorkoutDay: z
    .object({
      workoutPlanId: z.string(),
      id: z.string(),
      name: z.string(),
      isRest: z.boolean(),
      weekDay: weekDaySchema,
      estimatedDurationInSeconds: z.number().int(),
      coverImageUrl: z.string().optional(),
      exercisesCount: z.number().int(),
    })
    .optional(),
  workoutStreak: z.number().int(),
  consistencyByDay: consistencyByDaySchema,
});

export const statsQuerySchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});

export const statsResponseSchema = z.object({
  workoutStreak: z.number().int(),
  consistencyByDay: consistencyByDaySchema,
  completedWorkoutsCount: z.number().int(),
  conclusionRate: z.number().min(0).max(1),
  totalTimeInSeconds: z.number().int(),
});

export const userTrainDataInputSchema = z.object({
  weightInGrams: z.number().int().positive(),
  heightInCentimeters: z.number().int().positive(),
  age: z.number().int().positive(),
  bodyFatPercentage: z.number().int().min(0).max(100),
});

export const userTrainDataResponseSchema = userTrainDataInputSchema
  .extend({
    userId: z.string(),
    userName: z.string(),
  })
  .nullable();

export const aiChatBodySchema = z.object({
  messages: z.array(z.unknown()),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const emptyResponseSchema = z.null();
