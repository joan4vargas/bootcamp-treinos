import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { getSession } from "../lib/auth-session.js";
import { sendRouteError } from "../lib/route-error-handler.js";
import {
  dayParamsSchema,
  errorResponseSchema,
  sessionParamsSchema,
  updateWorkoutSessionBodySchema,
  workoutSessionResponseSchema,
} from "../schemas/index.js";
import { StartWorkoutSession } from "../usecases/StartWorkoutSession.js";
import { UpdateWorkoutSession } from "../usecases/UpdateWorkoutSession.js";

export const workoutSessionsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/:planId/days/:dayId/sessions",
    {
      schema: {
        operationId: "startWorkoutSession",
        tags: ["workout-sessions"],
        summary: "Inicia uma sessão de treino no dia",
        params: dayParamsSchema,
        response: {
          201: workoutSessionResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
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
        const startWorkoutSession = new StartWorkoutSession();
        const result = await startWorkoutSession.execute({
          userId: session.user.id,
          workoutPlanId: request.params.planId,
          workoutDayId: request.params.dayId,
        });

        return reply.status(201).send(result);
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );

  app.patch(
    "/:planId/days/:dayId/sessions/:sessionId",
    {
      schema: {
        operationId: "updateWorkoutSession",
        tags: ["workout-sessions"],
        summary: "Conclui uma sessão de treino",
        params: sessionParamsSchema,
        body: updateWorkoutSessionBodySchema,
        response: {
          200: workoutSessionResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
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
        const updateWorkoutSession = new UpdateWorkoutSession();
        const result = await updateWorkoutSession.execute({
          userId: session.user.id,
          workoutPlanId: request.params.planId,
          workoutDayId: request.params.dayId,
          sessionId: request.params.sessionId,
          completedAt: request.body.completedAt,
        });

        return result;
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );
};
