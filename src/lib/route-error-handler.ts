import type { FastifyInstance, FastifyReply } from "fastify";

import {
  NotFoundError,
  RestDayError,
  SessionAlreadyCompletedError,
  SessionAlreadyStartedError,
  WorkoutPlanNotActiveError,
} from "../errors/index.js";

interface SendRouteErrorOptions {
  app: FastifyInstance;
  reply: FastifyReply;
  error: unknown;
}

const conflictErrors = [
  { errorClass: WorkoutPlanNotActiveError, code: "WORKOUT_PLAN_NOT_ACTIVE" },
  { errorClass: RestDayError, code: "REST_DAY" },
  { errorClass: SessionAlreadyStartedError, code: "SESSION_ALREADY_STARTED" },
  {
    errorClass: SessionAlreadyCompletedError,
    code: "SESSION_ALREADY_COMPLETED",
  },
];

export const sendRouteError = ({
  app,
  reply,
  error,
}: SendRouteErrorOptions) => {
  app.log.error(error);

  if (error instanceof NotFoundError) {
    return reply.status(404).send({
      error: error.message,
      code: "NOT_FOUND_ERROR",
    });
  }

  const conflictError = conflictErrors.find(
    ({ errorClass }) => error instanceof errorClass,
  );

  if (conflictError && error instanceof Error) {
    return reply.status(409).send({
      error: error.message,
      code: conflictError.code,
    });
  }

  return reply.status(500).send({
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
};
