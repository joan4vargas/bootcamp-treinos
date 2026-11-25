import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { getSession } from "../lib/auth-session.js";
import { sendRouteError } from "../lib/route-error-handler.js";
import {
  errorResponseSchema,
  userTrainDataInputSchema,
  userTrainDataResponseSchema,
} from "../schemas/index.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";
import { UpsertUserTrainData } from "../usecases/UpsertUserTrainData.js";

export const meRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      prefixTrailingSlash: "no-slash",
      schema: {
        operationId: "getUserTrainData",
        tags: ["me"],
        summary:
          "Dados de treino do usuário (peso, altura, idade, % de gordura)",
        response: {
          200: userTrainDataResponseSchema,
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
        const getUserTrainData = new GetUserTrainData();
        const result = await getUserTrainData.execute({
          userId: session.user.id,
        });

        return result;
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );

  app.put(
    "/",
    {
      prefixTrailingSlash: "no-slash",
      schema: {
        operationId: "upsertUserTrainData",
        tags: ["me"],
        summary: "Cria ou atualiza os dados de treino do usuário",
        body: userTrainDataInputSchema,
        response: {
          200: userTrainDataResponseSchema,
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
        const upsertUserTrainData = new UpsertUserTrainData();
        const result = await upsertUserTrainData.execute({
          userId: session.user.id,
          ...request.body,
        });

        return result;
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );
};
