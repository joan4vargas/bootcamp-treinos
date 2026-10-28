import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import type { Prisma } from "../generated/prisma/client.js";
import { getSession } from "../lib/auth-session.js";
import { prisma } from "../lib/db.js";
import {
  errorResponseSchema,
  workoutDayInputSchema,
  workoutDayResponseSchema,
} from "./workout-schemas.js";

const createWorkoutPlanBodySchema = z.object({
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  workoutDays: z.array(workoutDayInputSchema).min(1),
});

const updateWorkoutPlanBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.name !== undefined || data.isActive !== undefined, {
    message: "At least one field must be provided",
  });

const listWorkoutPlansQuerySchema = z.object({
  isActive: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const workoutPlanResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  workoutDays: z.array(workoutDayResponseSchema),
});

const workoutPlanInclude = {
  workoutDays: {
    include: {
      exercises: {
        orderBy: {
          order: "asc",
        },
      },
    },
  },
} satisfies Prisma.WorkoutPlanInclude;

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
        },
      },
    },
    async (request, reply) => {
      const session = await getSession(request);

      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const { name, isActive, workoutDays } = request.body;

      const workoutPlan = await prisma.workoutPlan.create({
        data: {
          name,
          isActive,
          userId: session.user.id,
          workoutDays: {
            create: workoutDays.map((workoutDay) => ({
              name: workoutDay.name,
              weekDay: workoutDay.weekDay,
              isRest: workoutDay.isRest,
              exercises: {
                create: workoutDay.exercises.map((exercise) => ({
                  name: exercise.name,
                  order: exercise.order,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restTimeInSeconds: exercise.restTimeInSeconds,
                })),
              },
            })),
          },
        },
        include: workoutPlanInclude,
      });

      return reply.status(201).send(workoutPlan);
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
          200: z.array(workoutPlanResponseSchema),
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await getSession(request);

      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const { isActive, limit, offset } = request.query;

      const where = {
        userId: session.user.id,
        ...(isActive !== undefined ? { isActive: isActive === "true" } : {}),
      };

      const [workoutPlans, total] = await prisma.$transaction([
        prisma.workoutPlan.findMany({
          where,
          include: workoutPlanInclude,
          orderBy: [{ createdAt: "desc" }, { id: "asc" }],
          skip: offset,
          take: limit,
        }),
        prisma.workoutPlan.count({
          where,
        }),
      ]);

      reply.header("X-Total-Count", total);

      return workoutPlans;
    },
  );

  app.get(
    "/:id",
    {
      schema: {
        tags: ["workout-plans"],
        summary: "Busca um plano de treino pelo ID",
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: workoutPlanResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await getSession(request);

      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const workoutPlan = await prisma.workoutPlan.findFirst({
        where: {
          id: request.params.id,
          userId: session.user.id,
        },
        include: workoutPlanInclude,
      });

      if (!workoutPlan) {
        return reply.status(404).send({ message: "Workout plan not found" });
      }

      return workoutPlan;
    },
  );

  app.patch(
    "/:id",
    {
      schema: {
        tags: ["workout-plans"],
        summary: "Atualiza nome ou status de um plano de treino",
        params: z.object({
          id: z.uuid(),
        }),
        body: updateWorkoutPlanBodySchema,
        response: {
          200: workoutPlanResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await getSession(request);

      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const existingPlan = await prisma.workoutPlan.findFirst({
        where: {
          id: request.params.id,
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });

      if (!existingPlan) {
        return reply.status(404).send({ message: "Workout plan not found" });
      }

      const workoutPlan = await prisma.workoutPlan.update({
        where: {
          id: existingPlan.id,
        },
        data: request.body,
        include: workoutPlanInclude,
      });

      return workoutPlan;
    },
  );

  app.delete(
    "/:id",
    {
      schema: {
        tags: ["workout-plans"],
        summary: "Remove um plano de treino",
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          204: z.null(),
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await getSession(request);

      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const deleted = await prisma.$transaction(async (transaction) => {
        const workoutPlan = await transaction.workoutPlan.findFirst({
          where: {
            id: request.params.id,
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        });

        if (!workoutPlan) {
          return false;
        }

        const workoutDays = await transaction.workoutDay.findMany({
          where: {
            workoutPlanId: workoutPlan.id,
          },
          select: {
            id: true,
          },
        });

        await transaction.workoutExercise.deleteMany({
          where: {
            workoutDayId: {
              in: workoutDays.map((workoutDay) => workoutDay.id),
            },
          },
        });

        await transaction.workoutDay.deleteMany({
          where: {
            workoutPlanId: workoutPlan.id,
          },
        });

        await transaction.workoutPlan.delete({
          where: {
            id: workoutPlan.id,
          },
        });

        return true;
      });

      if (!deleted) {
        return reply.status(404).send({ message: "Workout plan not found" });
      }

      return reply.status(204).send(null);
    },
  );
};
