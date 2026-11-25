import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod/v4";

export const systemRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      schema: {
        operationId: "getApiStatus",
        tags: ["system"],
        summary: "Verifica se a API está no ar",
        description: "Hello World",
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    () => ({
      message: "API rodando com sucesso!",
    }),
  );

  app.get(
    "/health",
    {
      schema: {
        operationId: "getHealth",
        tags: ["system"],
        summary: "Healthcheck da API",
        description: "Verifica a saúde da API",
        response: {
          200: z.object({
            status: z.literal("ok"),
          }),
        },
      },
    },
    () => ({
      status: "ok" as const,
    }),
  );
};
