import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { getSession } from "../lib/auth-session.js";
import { sendRouteError } from "../lib/route-error-handler.js";
import {
  errorResponseSchema,
  homeDataResponseSchema,
  homeParamsSchema,
} from "../schemas/index.js";
import { GetHomeData } from "../usecases/GetHomeData.js";

export const homeRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/:date",
    {
      schema: {
        operationId: "getHomeData",
        tags: ["home"],
        summary:
          "Dados da tela inicial: treino do dia, sequência e consistência",
        params: homeParamsSchema,
        response: {
          200: homeDataResponseSchema,
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
        const getHomeData = new GetHomeData();
        const result = await getHomeData.execute({
          userId: session.user.id,
          date: request.params.date,
        });

        return result;
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );
};
