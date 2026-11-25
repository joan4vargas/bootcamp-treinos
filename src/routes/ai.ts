import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
  validateUIMessages,
} from "ai";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod/v4";

import { AI_SYSTEM_PROMPT } from "../lib/ai-prompt.js";
import { getSession } from "../lib/auth-session.js";
import {
  aiChatBodySchema,
  userTrainDataInputSchema,
  weekDaySchema,
  workoutExerciseInputSchema,
} from "../schemas/index.js";
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";
import { ListWorkoutPlans } from "../usecases/ListWorkoutPlans.js";
import { UpsertUserTrainData } from "../usecases/UpsertUserTrainData.js";

const MAX_STEPS = 10;

const aiWorkoutPlanSchema = z.object({
  name: z.string().min(1).describe("Nome do plano, ex.: Hipertrofia & Força"),
  workoutDays: z
    .array(
      z.object({
        name: z.string().min(1),
        weekDay: weekDaySchema,
        isRest: z.boolean(),
        exercises: z.array(workoutExerciseInputSchema),
      }),
    )
    .length(7),
});

export const aiRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/",
    {
      prefixTrailingSlash: "no-slash",
      schema: {
        operationId: "chatWithAi",
        tags: ["ai"],
        summary: "Chat com o Coach AI (streaming no formato do Vercel AI SDK)",
        body: aiChatBodySchema,
      },
    },
    async (request, reply) => {
      const session = await getSession(request);

      if (!session) {
        return reply
          .status(401)
          .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
      }

      const userId = session.user.id;

      let messages: UIMessage[];

      try {
        messages = await validateUIMessages({
          messages: request.body.messages,
        });
      } catch {
        return reply
          .status(400)
          .send({ error: "Invalid messages", code: "INVALID_MESSAGES" });
      }

      const result = streamText({
        model: openai("gpt-4o-mini"),
        system: `${AI_SYSTEM_PROMPT}\n\nO nome do usuário é ${session.user.name}.`,
        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(MAX_STEPS),
        tools: {
          getUserTrainData: tool({
            description:
              "Busca peso (gramas), altura (cm), idade e % de gordura do usuário. Retorna null se ainda não cadastrados.",
            inputSchema: z.object({}),
            execute: () => new GetUserTrainData().execute({ userId }),
          }),
          updateUserTrainData: tool({
            description:
              "Salva os dados de treino do usuário. weightInGrams deve estar em gramas.",
            inputSchema: userTrainDataInputSchema,
            execute: (input) =>
              new UpsertUserTrainData().execute({ userId, ...input }),
          }),
          getWorkoutPlans: tool({
            description: "Lista os planos de treino ativos do usuário.",
            inputSchema: z.object({}),
            execute: async () => {
              const { items } = await new ListWorkoutPlans().execute({
                userId,
                isActive: true,
              });

              return items;
            },
          }),
          createWorkoutPlan: tool({
            description:
              "Cria um plano de treino semanal com 7 dias e o torna o plano ativo.",
            inputSchema: aiWorkoutPlanSchema,
            execute: (input) =>
              new CreateWorkoutPlan().execute({
                userId,
                name: input.name,
                isActive: true,
                workoutDays: input.workoutDays,
              }),
          }),
        },
      });

      return reply.send(result.toUIMessageStreamResponse());
    },
  );
};
