import "./env.js";

import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "../src/lib/db.js";
import {
  authHeaders,
  createPlan,
  createTestApp,
  firstWorkoutDay,
  firstWorkoutExercise,
  resetDatabase,
  signUp,
  type WorkoutDayResponse,
  type WorkoutExerciseResponse,
  type WorkoutPlanResponse,
} from "./helpers.js";

const missingId = "22222222-2222-4222-8222-222222222222";

describe("workout days and exercises", () => {
  let app: FastifyInstance;
  let ownerCookie: string;
  let intruderCookie: string;
  let plan: WorkoutPlanResponse;
  let planId: string;
  let dayId: string;
  let exerciseId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase();
    ownerCookie = await signUp(app, "owner@example.com");
    intruderCookie = await signUp(app, "intruder@example.com");
    plan = await createPlan(app, ownerCookie);
    const day = firstWorkoutDay(plan);
    const exercise = firstWorkoutExercise(day);
    planId = plan.id;
    dayId = day.id;
    exerciseId = exercise.id;
  });

  afterAll(async () => {
    await resetDatabase();
    await app.close();
    await prisma.$disconnect();
  });

  it("adiciona um dia com exercícios", async () => {
    const response = await app.inject({
      method: "POST",
      url: `/workout-plans/${planId}/days`,
      headers: authHeaders(ownerCookie),
      payload: {
        name: "Treino B",
        weekDay: "TUESDAY",
        isRest: false,
        exercises: [
          {
            name: "Puxada frontal",
            order: 1,
            sets: 4,
            reps: 10,
            restTimeInSeconds: 60,
          },
          {
            name: "Remada curvada",
            order: 2,
            sets: 3,
            reps: 12,
            restTimeInSeconds: 60,
          },
        ],
      },
    });

    expect(response.statusCode).toBe(201);

    const createdDay = response.json() as WorkoutDayResponse;
    expect(createdDay.workoutPlanId).toBe(planId);
    expect(createdDay.name).toBe("Treino B");
    expect(createdDay.weekDay).toBe("TUESDAY");
    expect(createdDay.exercises).toHaveLength(2);
    expect(createdDay.exercises.map((item) => item.name)).toEqual([
      "Puxada frontal",
      "Remada curvada",
    ]);
  });

  it("adiciona um dia de descanso sem exercícios", async () => {
    const response = await app.inject({
      method: "POST",
      url: `/workout-plans/${planId}/days`,
      headers: authHeaders(ownerCookie),
      payload: {
        name: "Descanso",
        weekDay: "SUNDAY",
        isRest: true,
      },
    });

    expect(response.statusCode).toBe(201);

    const createdDay = response.json() as WorkoutDayResponse;
    expect(createdDay.isRest).toBe(true);
    expect(createdDay.exercises).toEqual([]);
  });

  it("atualiza um dia e mantém os exercícios", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${planId}/days/${dayId}`,
      headers: authHeaders(ownerCookie),
      payload: {
        name: "Treino A atualizado",
        weekDay: "WEDNESDAY",
        isRest: true,
      },
    });

    expect(response.statusCode).toBe(200);

    const updatedDay = response.json() as WorkoutDayResponse;
    expect(updatedDay.name).toBe("Treino A atualizado");
    expect(updatedDay.weekDay).toBe("WEDNESDAY");
    expect(updatedDay.isRest).toBe(true);
    expect(updatedDay.exercises).toHaveLength(1);
    expect(updatedDay.exercises[0]?.id).toBe(exerciseId);
  });

  it("adiciona e atualiza um exercício", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: `/workout-plans/${planId}/days/${dayId}/exercises`,
      headers: authHeaders(ownerCookie),
      payload: {
        name: "Rosca direta",
        order: 2,
        sets: 3,
        reps: 12,
        restTimeInSeconds: 45,
      },
    });

    expect(createResponse.statusCode).toBe(201);

    const createdExercise = createResponse.json() as WorkoutExerciseResponse;
    expect(createdExercise.name).toBe("Rosca direta");
    expect(createdExercise.workoutDayId).toBe(dayId);
    expect(createdExercise.order).toBe(2);

    const patchResponse = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${planId}/days/${dayId}/exercises/${createdExercise.id}`,
      headers: authHeaders(ownerCookie),
      payload: {
        name: "Rosca alternada",
        sets: 4,
        reps: 10,
      },
    });

    expect(patchResponse.statusCode).toBe(200);

    const updatedExercise = patchResponse.json() as WorkoutExerciseResponse;
    expect(updatedExercise.name).toBe("Rosca alternada");
    expect(updatedExercise.sets).toBe(4);
    expect(updatedExercise.reps).toBe(10);
    expect(updatedExercise.order).toBe(2);
  });

  it("remove um exercício", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: `/workout-plans/${planId}/days/${dayId}/exercises`,
      headers: authHeaders(ownerCookie),
      payload: {
        name: "Rosca direta",
        order: 2,
        sets: 3,
        reps: 12,
        restTimeInSeconds: 45,
      },
    });
    const createdExercise = createResponse.json() as WorkoutExerciseResponse;

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/workout-plans/${planId}/days/${dayId}/exercises/${createdExercise.id}`,
      headers: authHeaders(ownerCookie),
    });
    const getResponse = await app.inject({
      method: "GET",
      url: `/workout-plans/${planId}`,
      headers: authHeaders(ownerCookie),
    });

    expect(deleteResponse.statusCode).toBe(204);
    expect(getResponse.statusCode).toBe(200);

    const updatedPlan = getResponse.json() as WorkoutPlanResponse;
    const remainingIds = firstWorkoutDay(updatedPlan).exercises.map(
      (item) => item.id,
    );
    expect(remainingIds).not.toContain(createdExercise.id);
    expect(remainingIds).toContain(exerciseId);

    const exerciseCount = await prisma.workoutExercise.count({
      where: {
        id: createdExercise.id,
      },
    });
    expect(exerciseCount).toBe(0);
  });

  it("remove um dia e seus exercícios", async () => {
    const createDayResponse = await app.inject({
      method: "POST",
      url: `/workout-plans/${planId}/days`,
      headers: authHeaders(ownerCookie),
      payload: {
        name: "Treino C",
        weekDay: "FRIDAY",
        isRest: false,
        exercises: [
          {
            name: "Agachamento",
            order: 1,
            sets: 4,
            reps: 8,
            restTimeInSeconds: 90,
          },
        ],
      },
    });
    const createdDay = createDayResponse.json() as WorkoutDayResponse;

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/workout-plans/${planId}/days/${createdDay.id}`,
      headers: authHeaders(ownerCookie),
    });
    const getResponse = await app.inject({
      method: "GET",
      url: `/workout-plans/${planId}`,
      headers: authHeaders(ownerCookie),
    });
    const deleteAgainResponse = await app.inject({
      method: "DELETE",
      url: `/workout-plans/${planId}/days/${createdDay.id}`,
      headers: authHeaders(ownerCookie),
    });

    expect(deleteResponse.statusCode).toBe(204);
    expect(getResponse.statusCode).toBe(200);
    expect(deleteAgainResponse.statusCode).toBe(404);

    const updatedPlan = getResponse.json() as WorkoutPlanResponse;
    expect(updatedPlan.workoutDays.map((item) => item.id)).not.toContain(
      createdDay.id,
    );
    expect(updatedPlan.workoutDays.map((item) => item.id)).toContain(dayId);

    const [days, exercises] = await prisma.$transaction([
      prisma.workoutDay.count({
        where: {
          id: createdDay.id,
        },
      }),
      prisma.workoutExercise.count({
        where: {
          workoutDayId: createdDay.id,
        },
      }),
    ]);
    expect([days, exercises]).toEqual([0, 0]);
  });

  it("isola dias e exercícios entre usuários", async () => {
    const addDayResponse = await app.inject({
      method: "POST",
      url: `/workout-plans/${planId}/days`,
      headers: authHeaders(intruderCookie),
      payload: {
        name: "Invasão",
        weekDay: "MONDAY",
        isRest: false,
        exercises: [],
      },
    });
    const addExerciseResponse = await app.inject({
      method: "POST",
      url: `/workout-plans/${planId}/days/${dayId}/exercises`,
      headers: authHeaders(intruderCookie),
      payload: {
        name: "Invasão",
        order: 1,
        sets: 1,
        reps: 1,
        restTimeInSeconds: 0,
      },
    });
    const patchDayResponse = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${planId}/days/${dayId}`,
      headers: authHeaders(intruderCookie),
      payload: {
        name: "Invasão",
      },
    });
    const deleteExerciseResponse = await app.inject({
      method: "DELETE",
      url: `/workout-plans/${planId}/days/${dayId}/exercises/${exerciseId}`,
      headers: authHeaders(intruderCookie),
    });
    const anonymousAddDayResponse = await app.inject({
      method: "POST",
      url: `/workout-plans/${planId}/days`,
      payload: {
        name: "Anônimo",
        weekDay: "MONDAY",
        isRest: false,
        exercises: [],
      },
    });
    const anonymousPatchExerciseResponse = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${planId}/days/${dayId}/exercises/${exerciseId}`,
      payload: {
        name: "Anônimo",
      },
    });

    expect(addDayResponse.statusCode).toBe(404);
    expect(addExerciseResponse.statusCode).toBe(404);
    expect(patchDayResponse.statusCode).toBe(404);
    expect(deleteExerciseResponse.statusCode).toBe(404);
    expect(anonymousAddDayResponse.statusCode).toBe(401);
    expect(anonymousPatchExerciseResponse.statusCode).toBe(401);
  });

  it("valida payloads e trata recursos inexistentes", async () => {
    const emptyDayPatchResponse = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${planId}/days/${dayId}`,
      headers: authHeaders(ownerCookie),
      payload: {},
    });
    const emptyExercisePatchResponse = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${planId}/days/${dayId}/exercises/${exerciseId}`,
      headers: authHeaders(ownerCookie),
      payload: {},
    });
    const invalidWeekDayResponse = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${planId}/days/${dayId}`,
      headers: authHeaders(ownerCookie),
      payload: {
        weekDay: "FERIADO",
      },
    });
    const invalidDayIdResponse = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${planId}/days/not-a-uuid`,
      headers: authHeaders(ownerCookie),
      payload: {
        name: "X",
      },
    });

    expect(emptyDayPatchResponse.statusCode).toBe(400);
    expect(emptyExercisePatchResponse.statusCode).toBe(400);
    expect(invalidWeekDayResponse.statusCode).toBe(400);
    expect(invalidDayIdResponse.statusCode).toBe(400);

    const missingPlanResponse = await app.inject({
      method: "POST",
      url: `/workout-plans/${missingId}/days`,
      headers: authHeaders(ownerCookie),
      payload: {
        name: "X",
        weekDay: "MONDAY",
        isRest: false,
        exercises: [],
      },
    });
    const missingDayResponse = await app.inject({
      method: "POST",
      url: `/workout-plans/${planId}/days/${missingId}/exercises`,
      headers: authHeaders(ownerCookie),
      payload: {
        name: "X",
        order: 1,
        sets: 1,
        reps: 1,
        restTimeInSeconds: 0,
      },
    });
    const missingExercisePatchResponse = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${planId}/days/${dayId}/exercises/${missingId}`,
      headers: authHeaders(ownerCookie),
      payload: {
        name: "X",
      },
    });
    const missingExerciseDeleteResponse = await app.inject({
      method: "DELETE",
      url: `/workout-plans/${planId}/days/${dayId}/exercises/${missingId}`,
      headers: authHeaders(ownerCookie),
    });

    expect(missingPlanResponse.statusCode).toBe(404);
    expect(missingDayResponse.statusCode).toBe(404);
    expect(missingExercisePatchResponse.statusCode).toBe(404);
    expect(missingExerciseDeleteResponse.statusCode).toBe(404);
  });
});
