import "dotenv/config";

import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import Fastify, { type FastifyServerOptions } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "./lib/auth.js";
import { workoutDaysRoutes } from "./routes/workout-days.js";
import { workoutExercisesRoutes } from "./routes/workout-exercises.js";
import { workoutPlansRoutes } from "./routes/workout-plans.js";

export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: true,
    ...options,
  });

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Bootcamp Treinos API",
        description: "API para o bootcamp de treinos do FSC",
        version: "1.0.0",
      },
      servers: [
        {
          description: "Localhost",
          url: "http://localhost:3000",
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifyCors, {
    origin: ["http://localhost:3000"],
    credentials: true,
    exposedHeaders: ["X-Total-Count"],
  });

  await app.register(fastifyApiReference, {
    routePrefix: "/docs",
    configuration: {
      sources: [
        {
          title: "Bootcamp Treinos API",
          slug: "bootcamp-treinos-api",
          url: "/swagger.json",
        },
        {
          title: "Auth API",
          slug: "auth-api",
          url: "/api/auth/open-api/generate-schema",
        },
      ],
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/swagger.json",
    schema: {
      hide: true,
    },
    handler: async () => {
      return app.swagger();
    },
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Rotas de planos de treino
  await app.register(workoutPlansRoutes, {
    prefix: "/workout-plans",
  });
  await app.register(workoutDaysRoutes, {
    prefix: "/workout-plans",
  });
  await app.register(workoutExercisesRoutes, {
    prefix: "/workout-plans",
  });

  // Rota de teste
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      description: "Hello World",
      tags: ["hello"],
      response: {
        200: z.object({
          message: z.string(),
        }),
      },
    },
    handler: () => {
      return {
        message: "API rodando com sucesso!",
      };
    },
  });

  // Register authentication endpoint
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    schema: {
      hide: true,
    },
    async handler(request, reply) {
      try {
        const url = new URL(
          request.url,
          `http://${request.headers.host ?? "localhost:3000"}`,
        );

        const headers = new Headers();
        Object.entries(request.headers).forEach(([key, value]) => {
          if (value) headers.append(key, value.toString());
        });

        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        });

        const response = await auth.handler(req);

        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        return reply.send(response.body ? await response.text() : null);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  });

  return app;
}
