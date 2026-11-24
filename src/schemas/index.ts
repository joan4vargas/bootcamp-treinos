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
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.weekDay !== undefined ||
      data.isRest !== undefined,
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

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const emptyResponseSchema = z.null();
