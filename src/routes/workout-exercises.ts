import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import { getSession } from "../lib/auth-session.js";
import { prisma } from "../lib/db.js";
import {
  findOwnedWorkoutDay,
  findOwnedWorkoutExercise,
} from "../lib/workout-access.js";
import {
  errorResponseSchema,
  workoutExerciseInputSchema,
  workoutExerciseResponseSchema,
} from "./workout-schemas.js";

const dayParamsSchema = z.object({
  planId: z.uuid(),
  dayId: z.uuid(),
});

const exerciseParamsSchema = z.object({
  planId: z.uuid(),
  dayId: z.uuid(),
  exerciseId: z.uuid(),
});

const updateWorkoutExerciseBodySchema = z
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

export const workoutExercisesRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/:planId/days/:dayId/exercises",
    {
      schema: {
        tags: ["workout-exercises"],
        summary: "Adiciona um exercício ao dia de treino",
        params: dayParamsSchema,
        body: workoutExerciseInputSchema,
        response: {
          201: workoutExerciseResponseSchema,
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

      const workoutExercise = await prisma.workoutExercise.create({
        data: {
          ...request.body,
          workoutDayId: workoutDay.id,
        },
      });

      return reply.status(201).send(workoutExercise);
    },
  );

  app.patch(
    "/:planId/days/:dayId/exercises/:exerciseId",
    {
      schema: {
        tags: ["workout-exercises"],
        summary: "Atualiza um exercício do dia de treino",
        params: exerciseParamsSchema,
        body: updateWorkoutExerciseBodySchema,
        response: {
          200: workoutExerciseResponseSchema,
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

      const workoutExercise = await findOwnedWorkoutExercise(
        request.params.planId,
        request.params.dayId,
        request.params.exerciseId,
        session.user.id,
      );

      if (!workoutExercise) {
        return reply
          .status(404)
          .send({ message: "Workout exercise not found" });
      }

      const updatedWorkoutExercise = await prisma.workoutExercise.update({
        where: {
          id: workoutExercise.id,
        },
        data: request.body,
      });

      return updatedWorkoutExercise;
    },
  );

  app.delete(
    "/:planId/days/:dayId/exercises/:exerciseId",
    {
      schema: {
        tags: ["workout-exercises"],
        summary: "Remove um exercício do dia de treino",
        params: exerciseParamsSchema,
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

      const workoutExercise = await findOwnedWorkoutExercise(
        request.params.planId,
        request.params.dayId,
        request.params.exerciseId,
        session.user.id,
      );

      if (!workoutExercise) {
        return reply
          .status(404)
          .send({ message: "Workout exercise not found" });
      }

      await prisma.workoutExercise.delete({
        where: {
          id: workoutExercise.id,
        },
      });

      return reply.status(204).send(null);
    },
  );
};
