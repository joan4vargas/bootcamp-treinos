import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { getSession } from "../lib/auth-session.js";
import { sendRouteError } from "../lib/route-error-handler.js";
import {
  dayParamsSchema,
  emptyResponseSchema,
  errorResponseSchema,
  getWorkoutDayResponseSchema,
  planParamsSchema,
  updateWorkoutDayBodySchema,
  workoutDayInputSchema,
  workoutDayResponseSchema,
} from "../schemas/index.js";
import { CreateWorkoutDay } from "../usecases/CreateWorkoutDay.js";
import { DeleteWorkoutDay } from "../usecases/DeleteWorkoutDay.js";
import { GetWorkoutDay } from "../usecases/GetWorkoutDay.js";
import { UpdateWorkoutDay } from "../usecases/UpdateWorkoutDay.js";

export const workoutDaysRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/:planId/days",
    {
      schema: {
        operationId: "createWorkoutDay",
        tags: ["workout-days"],
        summary: "Adiciona um dia ao plano de treino",
        params: planParamsSchema,
        body: workoutDayInputSchema,
        response: {
          201: workoutDayResponseSchema,
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
        const createWorkoutDay = new CreateWorkoutDay();
        const result = await createWorkoutDay.execute({
          userId: session.user.id,
          workoutPlanId: request.params.planId,
          ...request.body,
        });

        return reply.status(201).send(result);
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );

  app.get(
    "/:planId/days/:dayId",
    {
      schema: {
        operationId: "getWorkoutDay",
        tags: ["workout-days"],
        summary: "Busca um dia do plano de treino com exercícios e sessões",
        params: dayParamsSchema,
        response: {
          200: getWorkoutDayResponseSchema,
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
        const getWorkoutDay = new GetWorkoutDay();
        const result = await getWorkoutDay.execute({
          userId: session.user.id,
          workoutPlanId: request.params.planId,
          workoutDayId: request.params.dayId,
        });

        return result;
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );

  app.patch(
    "/:planId/days/:dayId",
    {
      schema: {
        operationId: "updateWorkoutDay",
        tags: ["workout-days"],
        summary: "Atualiza um dia do plano de treino",
        params: dayParamsSchema,
        body: updateWorkoutDayBodySchema,
        response: {
          200: workoutDayResponseSchema,
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
        const updateWorkoutDay = new UpdateWorkoutDay();
        const result = await updateWorkoutDay.execute({
          userId: session.user.id,
          workoutPlanId: request.params.planId,
          workoutDayId: request.params.dayId,
          ...request.body,
        });

        return result;
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );

  app.delete(
    "/:planId/days/:dayId",
    {
      schema: {
        operationId: "deleteWorkoutDay",
        tags: ["workout-days"],
        summary: "Remove um dia do plano de treino",
        params: dayParamsSchema,
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
        const deleteWorkoutDay = new DeleteWorkoutDay();
        await deleteWorkoutDay.execute({
          userId: session.user.id,
          workoutPlanId: request.params.planId,
          workoutDayId: request.params.dayId,
        });

        return reply.status(204).send(null);
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );
};
