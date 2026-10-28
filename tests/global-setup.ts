import "./env.js";

import { execSync } from "node:child_process";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client.js";
import { adminDatabaseUrl, testDatabaseName, testDatabaseUrl } from "./env.js";

async function ensureTestDatabase() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: adminDatabaseUrl }),
  });

  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
      "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists",
      testDatabaseName,
    );

    if (!rows[0]?.exists) {
      const escapedDatabaseName = testDatabaseName.replaceAll('"', '""');
      await prisma.$executeRawUnsafe(
        `CREATE DATABASE "${escapedDatabaseName}"`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

export default async function globalSetup() {
  await ensureTestDatabase();

  execSync("pnpm exec prisma migrate deploy", {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
    stdio: "inherit",
  });
}
