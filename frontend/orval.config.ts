import "dotenv/config";

import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: `${process.env.NEXT_PUBLIC_API_URL}/swagger.json`,
    output: {
      target: "./app/_lib/api/fetch-generated/index.ts",
      client: "fetch",
      prettier: true,
      override: {
        mutator: {
          path: "./app/_lib/api/fetch.ts",
          name: "customFetch",
        },
      },
    },
  },
});
