import "dotenv/config";

const defaultOrigin = "http://localhost:3000";

function normalizeOrigin(origin: string) {
  const trimmed = origin.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);
    return url.origin === "null" ? trimmed : url.origin;
  } catch {
    return trimmed;
  }
}

export function parseOrigins(
  value: string | undefined,
  fallback = defaultOrigin,
) {
  const source = value?.trim() ? value : fallback;
  const origins = source
    .split(",")
    .map(normalizeOrigin)
    .filter((origin) => origin.length > 0);

  if (origins.length === 0) {
    throw new Error("At least one origin must be configured");
  }

  if (origins.includes("*")) {
    throw new Error(
      "Wildcard origins are not allowed when credentials are enabled",
    );
  }

  return [...new Set(origins)];
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const authUrl = process.env.BETTER_AUTH_URL ?? defaultOrigin;

export const allowedOrigins = parseOrigins(process.env.CORS_ORIGINS, authUrl);

export const trustedOrigins = parseOrigins(
  process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? process.env.CORS_ORIGINS,
  authUrl,
);

export const rateLimit = {
  max: positiveInteger(process.env.RATE_LIMIT_MAX, 100),
  timeWindow: process.env.RATE_LIMIT_WINDOW ?? "1 minute",
};

export const authRateLimit = {
  max: positiveInteger(process.env.AUTH_RATE_LIMIT_MAX, 20),
  timeWindow: process.env.AUTH_RATE_LIMIT_WINDOW ?? "1 minute",
};

export const trustProxy = process.env.TRUST_PROXY === "true";
