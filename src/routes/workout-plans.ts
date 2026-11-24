import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { getSession } from "../lib/auth-session.js";
import { sendRouteError } from "../lib/route-error-handler.js";
import {
  createWorkoutPlanBodySchema,
  emptyResponseSchema,
  errorResponseSchema,
  idParamsSchema,
  listWorkoutPlansQuerySchema,
  updateWorkoutPlanBodySchema,
  workoutPlanResponseSchema,
} from "../schemas/index.js";
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { DeleteWorkoutPlan } from "../usecases/DeleteWorkoutPlan.js";
import { GetWorkoutPlan } from "../usecases/GetWorkoutPlan.js";
import { ListWorkoutPlans } from "../usecases/ListWorkoutPlans.js";
import { UpdateWorkoutPlan } from "../usecases/UpdateWorkoutPlan.js";

export const workoutPlansRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/",
    {
      prefixTrailingSlash: "no-slash",
      schema: {
        tags: ["workout-plans"],
        summary: "Cria um plano de treino",
        body: createWorkoutPlanBodySchema,
        response: {
          201: workoutPlanResponseSchema,
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
        const createWorkoutPlan = new CreateWorkoutPlan();
        const result = await createWorkoutPlan.execute({
          userId: session.user.id,
          ...request.body,
        });

        return reply.status(201).send(result);
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );

  app.get(
    "/",
    {
      prefixTrailingSlash: "no-slash",
      schema: {
        tags: ["workout-plans"],
        summary: "Lista os planos de treino do usuário autenticado",
        description:
          "Permite filtrar por isActive e paginar com limit/offset. O total é retornado no header X-Total-Count.",
        querystring: listWorkoutPlansQuerySchema,
        response: {
          200: workoutPlanResponseSchema.array(),
          401: errorResponseSchema,
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
        const { isActive, limit, offset } = request.query;
        const listWorkoutPlans = new ListWorkoutPlans();
        const result = await listWorkoutPlans.execute({
          userId: session.user.id,
          isActive: isActive === undefined ? undefined : isActive === "true",
          limit,
          offset,
        });

        reply.header("X-Total-Count", result.total);

        return result.items;
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );

  app.get(
    "/:id",
    {
      schema: {
        tags: ["workout-plans"],
        summary: "Busca um plano de treino pelo ID",
        params: idParamsSchema,
        response: {
          200: workoutPlanResponseSchema,
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
        const getWorkoutPlan = new GetWorkoutPlan();
        const result = await getWorkoutPlan.execute({
          userId: session.user.id,
          workoutPlanId: request.params.id,
        });

        return result;
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );

  app.patch(
    "/:id",
    {
      schema: {
        tags: ["workout-plans"],
        summary: "Atualiza nome ou status de um plano de treino",
        params: idParamsSchema,
        body: updateWorkoutPlanBodySchema,
        response: {
          200: workoutPlanResponseSchema,
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
        const updateWorkoutPlan = new UpdateWorkoutPlan();
        const result = await updateWorkoutPlan.execute({
          userId: session.user.id,
          workoutPlanId: request.params.id,
          ...request.body,
        });

        return result;
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );

  app.delete(
    "/:id",
    {
      schema: {
        tags: ["workout-plans"],
        summary: "Remove um plano de treino",
        params: idParamsSchema,
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
        const deleteWorkoutPlan = new DeleteWorkoutPlan();
        await deleteWorkoutPlan.execute({
          userId: session.user.id,
          workoutPlanId: request.params.id,
        });

        return reply.status(204).send(null);
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );
};
