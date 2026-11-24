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

export const firstWorkoutDay = (plan: WorkoutPlanResponse) => {
  const workoutDay = plan.workoutDays[0];

  if (!workoutDay) {
    throw new Error("Workout plan has no days");
  }

  return workoutDay;
};

export const firstWorkoutExercise = (day: WorkoutDayResponse) => {
  const workoutExercise = day.exercises[0];

  if (!workoutExercise) {
    throw new Error("Workout day has no exercises");
  }

  return workoutExercise;
};

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

export const createTestApp = async () => {
  const app = await buildApp({ logger: false });
  await app.ready();
  return app;
};

export const resetDatabase = async () => {
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutDay.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
};

interface CookieResponse {
  cookies: Array<{
    name: string;
    value: string;
  }>;
}

const getCookie = (response: CookieResponse) =>
  response.cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");

interface SignUpOptions {
  app: FastifyInstance;
  email: string;
  name?: string;
}

export const signUp = async ({
  app,
  email,
  name = "Test User",
}: SignUpOptions) => {
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
};

export const authHeaders = (cookie: string) => ({
  cookie,
});

interface CreatePlanOptions {
  app: FastifyInstance;
  cookie: string;
  payload?: CreateWorkoutPlanPayload;
}

export const createPlan = async ({
  app,
  cookie,
  payload = defaultPlanPayload,
}: CreatePlanOptions) => {
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
};
