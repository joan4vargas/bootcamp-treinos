import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { getSession } from "../lib/auth-session.js";
import { sendRouteError } from "../lib/route-error-handler.js";
import {
  errorResponseSchema,
  statsQuerySchema,
  statsResponseSchema,
} from "../schemas/index.js";
import { GetStats } from "../usecases/GetStats.js";

export const statsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      prefixTrailingSlash: "no-slash",
      schema: {
        operationId: "getStats",
        tags: ["stats"],
        summary: "Estatísticas de treino do usuário em um período",
        querystring: statsQuerySchema,
        response: {
          200: statsResponseSchema,
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
        const getStats = new GetStats();
        const result = await getStats.execute({
          userId: session.user.id,
          from: request.query.from,
          to: request.query.to,
        });

        return result;
      } catch (error) {
        return sendRouteError({ app, reply, error });
      }
    },
  );
};
