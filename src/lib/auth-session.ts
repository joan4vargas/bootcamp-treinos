import { fromNodeHeaders } from "better-auth/node";
import type { FastifyRequest } from "fastify";

import { auth } from "./auth.js";

export async function getSession(request: FastifyRequest) {
  return auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });
}
