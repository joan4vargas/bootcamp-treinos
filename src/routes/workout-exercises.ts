import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { getSession } from "../lib/auth-session.js";
import { sendRouteError } from "../lib/route-error-handler.js";
import {
  dayParamsSchema,
  emptyResponseSchema,
  errorResponseSchema,
  exerciseParamsSchema,
  updateWorkoutExerciseBodySchema,
  workoutExerciseInputSchema,
  workoutExerciseResponseSchema,
} from "../schemas/index.js";
import { CreateWorkoutExercise } from "../usecases/CreateWorkoutExercise.js";
import { DeleteWorkoutExercise } from "../usecases/DeleteWorkoutExercise.js";
import { UpdateWorkoutExercise } from "../usecases/UpdateWorkoutExercise.js";

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
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await getSession(request);

      if (!session) {
        return reply
          .status(401)
          .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
      }

      try {
        const createWorkoutExercise = new CreateWorkoutExercise();
        const result = await createWorkoutExercise.execute({
          userId: session.user.id,
          workoutPlanId: request.params.planId,
          workoutDayId: request.params.dayId,
          ...request.body,
        });

        return reply.status(201).send(result);
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
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
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await getSession(request);

      if (!session) {
        return reply
          .status(401)
          .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
      }

      try {
        const updateWorkoutExercise = new UpdateWorkoutExercise();
        const result = await updateWorkoutExercise.execute({
          userId: session.user.id,
          workoutPlanId: request.params.planId,
          workoutDayId: request.params.dayId,
          workoutExerciseId: request.params.exerciseId,
          ...request.body,
        });

        return result;
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
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
          204: emptyResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await getSession(request);

      if (!session) {
        return reply
          .status(401)
          .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
      }

      try {
        const deleteWorkoutExercise = new DeleteWorkoutExercise();
        await deleteWorkoutExercise.execute({
          userId: session.user.id,
          workoutPlanId: request.params.planId,
          workoutDayId: request.params.dayId,
          workoutExerciseId: request.params.exerciseId,
        });

        return reply.status(204).send(null);
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );
};
