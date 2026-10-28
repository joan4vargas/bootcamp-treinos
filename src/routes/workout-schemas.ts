import { z } from "zod";

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

export const workoutExerciseResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number().int(),
  workoutDayId: z.string(),
  sets: z.number().int(),
  reps: z.number().int(),
  restTimeInSeconds: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const workoutDayResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  workoutPlanId: z.string(),
  isRest: z.boolean(),
  weekDay: weekDaySchema,
  exercises: z.array(workoutExerciseResponseSchema),
  createdAt: z.date(),
  updateAt: z.date(),
});

export const errorResponseSchema = z.object({
  message: z.string(),
});
