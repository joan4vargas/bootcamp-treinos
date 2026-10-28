import "./env.js";

import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "../src/lib/db.js";
import {
  authHeaders,
  createPlan,
  createTestApp,
  defaultPlanPayload,
  firstWorkoutDay,
  firstWorkoutExercise,
  resetDatabase,
  signUp,
  type WorkoutPlanResponse,
} from "./helpers.js";

describe("workout plans", () => {
  let app: FastifyInstance;
  let cookie: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase();
    cookie = await signUp(app, "plans@example.com");
  });

  afterAll(async () => {
    await resetDatabase();
    await app.close();
    await prisma.$disconnect();
  });

  it("cria um plano com dias e exercícios", async () => {
    const plan = await createPlan(app, cookie);
    const day = firstWorkoutDay(plan);
    const exercise = firstWorkoutExercise(day);

    expect(plan.name).toBe(defaultPlanPayload.name);
    expect(plan.isActive).toBe(true);
    expect(day.name).toBe("Treino A");
    expect(day.weekDay).toBe("MONDAY");
    expect(exercise.name).toBe("Supino reto");

    const savedPlan = await prisma.workoutPlan.findUnique({
      where: {
        id: plan.id,
      },
      include: {
        workoutDays: {
          include: {
            exercises: true,
          },
        },
      },
    });

    expect(savedPlan).not.toBeNull();
    expect(savedPlan?.workoutDays).toHaveLength(1);
    expect(savedPlan?.workoutDays[0]?.exercises[0]?.name).toBe("Supino reto");
  });

  it("exige autenticação", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/workout-plans",
      payload: defaultPlanPayload,
    });
    const listResponse = await app.inject({
      method: "GET",
      url: "/workout-plans",
    });

    expect(createResponse.statusCode).toBe(401);
    expect(listResponse.statusCode).toBe(401);
  });

  it("lista com filtro e paginação", async () => {
    const activeA = await createPlan(app, cookie, {
      ...defaultPlanPayload,
      name: "Ativo A",
      isActive: true,
    });
    const activeB = await createPlan(app, cookie, {
      ...defaultPlanPayload,
      name: "Ativo B",
      isActive: true,
    });
    const inactive = await createPlan(app, cookie, {
      ...defaultPlanPayload,
      name: "Inativo",
      isActive: false,
    });

    const firstPage = await app.inject({
      method: "GET",
      url: "/workout-plans?isActive=true&limit=1&offset=0",
      headers: authHeaders(cookie),
    });
    const secondPage = await app.inject({
      method: "GET",
      url: "/workout-plans?isActive=true&limit=1&offset=1",
      headers: authHeaders(cookie),
    });
    const inactivePage = await app.inject({
      method: "GET",
      url: "/workout-plans?isActive=false",
      headers: authHeaders(cookie),
    });

    expect(firstPage.statusCode).toBe(200);
    expect(firstPage.headers["x-total-count"]).toBe("2");

    const firstPagePlans = firstPage.json() as WorkoutPlanResponse[];
    const secondPagePlans = secondPage.json() as WorkoutPlanResponse[];
    const inactivePlans = inactivePage.json() as WorkoutPlanResponse[];

    expect(firstPagePlans).toHaveLength(1);
    expect(secondPagePlans).toHaveLength(1);
    expect(firstPagePlans[0]?.id).not.toBe(secondPagePlans[0]?.id);
    expect(new Set([firstPagePlans[0]?.id, secondPagePlans[0]?.id])).toEqual(
      new Set([activeA.id, activeB.id]),
    );

    expect(inactivePage.headers["x-total-count"]).toBe("1");
    expect(inactivePlans).toHaveLength(1);
    expect(inactivePlans[0]?.id).toBe(inactive.id);
  });

  it("busca e atualiza um plano", async () => {
    const plan = await createPlan(app, cookie);

    const getResponse = await app.inject({
      method: "GET",
      url: `/workout-plans/${plan.id}`,
      headers: authHeaders(cookie),
    });
    const patchResponse = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${plan.id}`,
      headers: authHeaders(cookie),
      payload: {
        name: "Plano atualizado",
        isActive: false,
      },
    });
    const emptyPatchResponse = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${plan.id}`,
      headers: authHeaders(cookie),
      payload: {},
    });

    expect(getResponse.statusCode).toBe(200);
    expect((getResponse.json() as WorkoutPlanResponse).id).toBe(plan.id);

    expect(patchResponse.statusCode).toBe(200);
    const patchedPlan = patchResponse.json() as WorkoutPlanResponse;
    expect(patchedPlan.name).toBe("Plano atualizado");
    expect(patchedPlan.isActive).toBe(false);
    expect(emptyPatchResponse.statusCode).toBe(400);
  });

  it("valida payload e trata recursos inexistentes", async () => {
    const invalidCreateResponse = await app.inject({
      method: "POST",
      url: "/workout-plans",
      headers: authHeaders(cookie),
      payload: {
        name: "",
        isActive: true,
        workoutDays: [],
      },
    });
    const invalidIdResponse = await app.inject({
      method: "GET",
      url: "/workout-plans/not-a-uuid",
      headers: authHeaders(cookie),
    });

    expect(invalidCreateResponse.statusCode).toBe(400);
    expect(invalidIdResponse.statusCode).toBe(400);

    const missingId = "11111111-1111-4111-8111-111111111111";
    const getMissingResponse = await app.inject({
      method: "GET",
      url: `/workout-plans/${missingId}`,
      headers: authHeaders(cookie),
    });
    const patchMissingResponse = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${missingId}`,
      headers: authHeaders(cookie),
      payload: {
        name: "Inexistente",
      },
    });
    const deleteMissingResponse = await app.inject({
      method: "DELETE",
      url: `/workout-plans/${missingId}`,
      headers: authHeaders(cookie),
    });

    expect(getMissingResponse.statusCode).toBe(404);
    expect(patchMissingResponse.statusCode).toBe(404);
    expect(deleteMissingResponse.statusCode).toBe(404);
  });

  it("isola planos entre usuários", async () => {
    const plan = await createPlan(app, cookie);
    const otherCookie = await signUp(app, "other@example.com");

    const getOtherResponse = await app.inject({
      method: "GET",
      url: `/workout-plans/${plan.id}`,
      headers: authHeaders(otherCookie),
    });
    const patchOtherResponse = await app.inject({
      method: "PATCH",
      url: `/workout-plans/${plan.id}`,
      headers: authHeaders(otherCookie),
      payload: {
        name: "Invasão",
      },
    });
    const deleteOtherResponse = await app.inject({
      method: "DELETE",
      url: `/workout-plans/${plan.id}`,
      headers: authHeaders(otherCookie),
    });
    const ownerGetResponse = await app.inject({
      method: "GET",
      url: `/workout-plans/${plan.id}`,
      headers: authHeaders(cookie),
    });

    expect(getOtherResponse.statusCode).toBe(404);
    expect(patchOtherResponse.statusCode).toBe(404);
    expect(deleteOtherResponse.statusCode).toBe(404);
    expect(ownerGetResponse.statusCode).toBe(200);
  });

  it("remove o plano e seus filhos", async () => {
    const plan = await createPlan(app, cookie);

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/workout-plans/${plan.id}`,
      headers: authHeaders(cookie),
    });
    const getResponse = await app.inject({
      method: "GET",
      url: `/workout-plans/${plan.id}`,
      headers: authHeaders(cookie),
    });
    const deleteAgainResponse = await app.inject({
      method: "DELETE",
      url: `/workout-plans/${plan.id}`,
      headers: authHeaders(cookie),
    });

    expect(deleteResponse.statusCode).toBe(204);
    expect(getResponse.statusCode).toBe(404);
    expect(deleteAgainResponse.statusCode).toBe(404);

    const [plans, days, exercises] = await prisma.$transaction([
      prisma.workoutPlan.count({
        where: {
          id: plan.id,
        },
      }),
      prisma.workoutDay.count({
        where: {
          workoutPlanId: plan.id,
        },
      }),
      prisma.workoutExercise.count({
        where: {
          workoutDay: {
            workoutPlanId: plan.id,
          },
        },
      }),
    ]);

    expect([plans, days, exercises]).toEqual([0, 0, 0]);
  });
});
