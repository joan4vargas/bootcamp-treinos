import type { FastifyInstance, FastifyReply } from "fastify";

import { NotFoundError } from "../errors/index.js";

interface SendRouteErrorOptions {
  app: FastifyInstance;
  reply: FastifyReply;
  error: unknown;
}

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

  return reply.status(500).send({
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
};
