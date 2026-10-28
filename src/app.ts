import "dotenv/config";

import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
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
import {
  allowedOrigins,
  authRateLimit as defaultAuthRateLimit,
  rateLimit as defaultRateLimit,
  trustProxy,
} from "./lib/config.js";
import { workoutDaysRoutes } from "./routes/workout-days.js";
import { workoutExercisesRoutes } from "./routes/workout-exercises.js";
import { workoutPlansRoutes } from "./routes/workout-plans.js";

type RateLimitOptions = {
  max?: number;
  timeWindow?: string | number;
};

export interface BuildAppOptions extends FastifyServerOptions {
  authRateLimit?: RateLimitOptions;
  rateLimit?: RateLimitOptions;
}

export async function buildApp(options: BuildAppOptions = {}) {
  const {
    authRateLimit: authRateLimitOverride,
    rateLimit: rateLimitOverride,
    ...fastifyOptions
  } = options;
  const app = Fastify({
    logger: true,
    trustProxy,
    ...fastifyOptions,
  });
  const globalRateLimit = {
    ...defaultRateLimit,
    ...rateLimitOverride,
  };
  const authRateLimitOptions = {
    ...defaultAuthRateLimit,
    ...authRateLimitOverride,
  };

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  await app.register(fastifyRateLimit, {
    global: true,
    max: globalRateLimit.max,
    timeWindow: globalRateLimit.timeWindow,
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
    origin: allowedOrigins,
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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/health",
    schema: {
      description: "Verifica a saúde da API",
      tags: ["health"],
      response: {
        200: z.object({
          status: z.literal("ok"),
        }),
      },
    },
    handler: () => {
      return {
        status: "ok" as const,
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
    config: {
      rateLimit: authRateLimitOptions,
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

        // O Fastify já resolve o IP real (respeitando TRUST_PROXY quando habilitado).
        // Sobrescrevemos qualquer X-Forwarded-For enviado pelo cliente para que o
        // rate limit interno do better-auth use uma chave confiável.
        headers.set("x-forwarded-for", request.ip);

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
