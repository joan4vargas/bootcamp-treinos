import "./env.js";

import type { FastifyInstance } from "fastify";

import { buildApp } from "../src/app.js";
import { prisma } from "../src/lib/db.js";

export interface WorkoutExerciseResponse {
  id: string;
  name: string;
  order: number;
  workoutDayId: string;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
}

export interface WorkoutDayResponse {
  id: string;
  name: string;
  workoutPlanId: string;
  isRest: boolean;
  weekDay: string;
  exercises: WorkoutExerciseResponse[];
}

export interface WorkoutPlanResponse {
  id: string;
  name: string;
  userId: string;
  isActive: boolean;
  workoutDays: WorkoutDayResponse[];
}

export function firstWorkoutDay(plan: WorkoutPlanResponse) {
  const workoutDay = plan.workoutDays[0];

  if (!workoutDay) {
    throw new Error("Workout plan has no days");
  }

  return workoutDay;
}

export function firstWorkoutExercise(day: WorkoutDayResponse) {
  const workoutExercise = day.exercises[0];

  if (!workoutExercise) {
    throw new Error("Workout day has no exercises");
  }

  return workoutExercise;
}

export interface CreateWorkoutPlanPayload {
  name: string;
  isActive: boolean;
  workoutDays: Array<{
    name: string;
    weekDay: string;
    isRest: boolean;
    exercises: Array<{
      name: string;
      order: number;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

export const defaultPlanPayload: CreateWorkoutPlanPayload = {
  name: "Plano de teste",
  isActive: true,
  workoutDays: [
    {
      name: "Treino A",
      weekDay: "MONDAY",
      isRest: false,
      exercises: [
        {
          name: "Supino reto",
          order: 1,
          sets: 4,
          reps: 10,
          restTimeInSeconds: 60,
        },
      ],
    },
  ],
};

export async function createTestApp() {
  const app = await buildApp({ logger: false });
  await app.ready();
  return app;
}

export async function resetDatabase() {
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutDay.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
}

type CookieResponse = {
  cookies: Array<{
    name: string;
    value: string;
  }>;
};

function getCookie(response: CookieResponse) {
  return response.cookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function signUp(
  app: FastifyInstance,
  email: string,
  name = "Test User",
) {
  const response = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: {
      origin: "http://localhost:3000",
    },
    payload: {
      email,
      password: "SenhaForte123!",
      name,
    },
  });

  if (response.statusCode !== 200 && response.statusCode !== 201) {
    throw new Error(
      `Signup failed with status ${response.statusCode}: ${response.body}`,
    );
  }

  const cookie = getCookie(response);

  if (!cookie) {
    throw new Error("Signup did not return a session cookie");
  }

  return cookie;
}

export function authHeaders(cookie: string) {
  return {
    cookie,
  };
}

export async function createPlan(
  app: FastifyInstance,
  cookie: string,
  payload: CreateWorkoutPlanPayload = defaultPlanPayload,
) {
  const response = await app.inject({
    method: "POST",
    url: "/workout-plans",
    headers: authHeaders(cookie),
    payload,
  });

  if (response.statusCode !== 201) {
    throw new Error(
      `Plan creation failed with status ${response.statusCode}: ${response.body}`,
    );
  }

  return response.json() as WorkoutPlanResponse;
}
