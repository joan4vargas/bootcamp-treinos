import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import type { Prisma } from "../generated/prisma/client.js";
import { getSession } from "../lib/auth-session.js";
import { prisma } from "../lib/db.js";
import {
  findOwnedWorkoutDay,
  findOwnedWorkoutPlan,
} from "../lib/workout-access.js";
import {
  errorResponseSchema,
  weekDaySchema,
  workoutDayInputSchema,
  workoutDayResponseSchema,
} from "./workout-schemas.js";

const planParamsSchema = z.object({
  planId: z.uuid(),
});

const dayParamsSchema = z.object({
  planId: z.uuid(),
  dayId: z.uuid(),
});

const updateWorkoutDayBodySchema = z
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

const workoutDayInclude = {
  exercises: {
    orderBy: {
      order: "asc",
    },
  },
} satisfies Prisma.WorkoutDayInclude;

export const workoutDaysRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/:planId/days",
    {
      schema: {
        tags: ["workout-days"],
        summary: "Adiciona um dia ao plano de treino",
        params: planParamsSchema,
        body: workoutDayInputSchema,
        response: {
          201: workoutDayResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await getSession(request);

      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const workoutPlan = await findOwnedWorkoutPlan(
        request.params.planId,
        session.user.id,
      );

      if (!workoutPlan) {
        return reply.status(404).send({ message: "Workout plan not found" });
      }

      const { name, weekDay, isRest, exercises } = request.body;

      const workoutDay = await prisma.workoutDay.create({
        data: {
          name,
          weekDay,
          isRest,
          workoutPlanId: workoutPlan.id,
          exercises: {
            create: exercises.map((exercise) => ({
              name: exercise.name,
              order: exercise.order,
              sets: exercise.sets,
              reps: exercise.reps,
              restTimeInSeconds: exercise.restTimeInSeconds,
            })),
          },
        },
        include: workoutDayInclude,
      });

      return reply.status(201).send(workoutDay);
    },
  );

  app.patch(
    "/:planId/days/:dayId",
    {
      schema: {
        tags: ["workout-days"],
        summary: "Atualiza um dia do plano de treino",
        params: dayParamsSchema,
        body: updateWorkoutDayBodySchema,
        response: {
          200: workoutDayResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await getSession(request);

      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const workoutDay = await findOwnedWorkoutDay(
        request.params.planId,
        request.params.dayId,
        session.user.id,
      );

      if (!workoutDay) {
        return reply.status(404).send({ message: "Workout day not found" });
      }

      const updatedWorkoutDay = await prisma.workoutDay.update({
        where: {
          id: workoutDay.id,
        },
        data: request.body,
        include: workoutDayInclude,
      });

      return updatedWorkoutDay;
    },
  );

  app.delete(
    "/:planId/days/:dayId",
    {
      schema: {
        tags: ["workout-days"],
        summary: "Remove um dia do plano de treino",
        params: dayParamsSchema,
        response: {
          204: z.null(),
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await getSession(request);

      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const workoutDay = await findOwnedWorkoutDay(
        request.params.planId,
        request.params.dayId,
        session.user.id,
      );

      if (!workoutDay) {
        return reply.status(404).send({ message: "Workout day not found" });
      }

      await prisma.$transaction([
        prisma.workoutExercise.deleteMany({
          where: {
            workoutDayId: workoutDay.id,
          },
        }),
        prisma.workoutDay.delete({
          where: {
            id: workoutDay.id,
          },
        }),
      ]);

      return reply.status(204).send(null);
    },
  );
};
