import "dotenv/config";

import { buildApp } from "./app.js";

const app = await buildApp({ logger: true });
const host = process.env.HOST ?? "localhost";
const port = Number(process.env.PORT) || 8080;

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
