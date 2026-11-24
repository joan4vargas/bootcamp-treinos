import { fromNodeHeaders } from "better-auth/node";
import type { FastifyRequest } from "fastify";

import { auth } from "./auth.js";

export const getSession = async (request: FastifyRequest) =>
  auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });
