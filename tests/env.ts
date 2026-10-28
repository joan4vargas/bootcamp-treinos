import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const baseUrl = new URL(databaseUrl);
baseUrl.searchParams.delete("schema");

const baseDatabaseName = decodeURIComponent(
  baseUrl.pathname.replace(/^\//, ""),
);

export const testDatabaseName =
  process.env.TEST_DATABASE_NAME ??
  (baseDatabaseName.endsWith("-test")
    ? baseDatabaseName
    : `${baseDatabaseName}-test`);

const testUrl = new URL(baseUrl);
testUrl.pathname = `/${testDatabaseName}`;

const adminUrl = new URL(baseUrl);
adminUrl.pathname = "/postgres";

export const testDatabaseUrl = testUrl.toString();
export const adminDatabaseUrl = adminUrl.toString();

process.env.DATABASE_URL = testDatabaseUrl;
process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
process.env.RATE_LIMIT_MAX ??= "10000";
process.env.AUTH_RATE_LIMIT_MAX ??= "10000";
