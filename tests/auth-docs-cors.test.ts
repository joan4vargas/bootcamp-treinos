import "./env.js";

import type { FastifyInstance } from "fastify";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { auth } from "../src/lib/auth.js";
import { prisma } from "../src/lib/db.js";
import { createPlan, createTestApp, resetDatabase, signUp } from "./helpers.js";

const origin = "http://localhost:3000";

describe("auth, documentation and CORS", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await app.close();
    await prisma.$disconnect();
  });

  it("retorna sessão nula sem cookie e sessão do usuário com cookie", async () => {
    const anonymousResponse = await app.inject({
      method: "GET",
      url: "/api/auth/get-session",
    });

    expect(anonymousResponse.statusCode).toBe(200);
    expect(anonymousResponse.json()).toBeNull();

    const cookie = await signUp(app, "session@example.com");
    const sessionResponse = await app.inject({
      method: "GET",
      url: "/api/auth/get-session",
      headers: {
        cookie,
      },
    });

    expect(sessionResponse.statusCode).toBe(200);

    const session = sessionResponse.json() as {
      user: {
        email: string;
      };
    };
    expect(session.user.email).toBe("session@example.com");
  });

  it("faz login, logout e invalida a sessão", async () => {
    const cookie = await signUp(app, "login@example.com");

    const signOutResponse = await app.inject({
      method: "POST",
      url: "/api/auth/sign-out",
      headers: {
        cookie,
        origin,
      },
    });
    const afterSignOutResponse = await app.inject({
      method: "GET",
      url: "/api/auth/get-session",
      headers: {
        cookie,
      },
    });

    expect(signOutResponse.statusCode).toBe(200);
    expect(signOutResponse.json()).toEqual({ success: true });
    expect(afterSignOutResponse.statusCode).toBe(200);
    expect(afterSignOutResponse.json()).toBeNull();

    const wrongPasswordResponse = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      headers: {
        origin,
      },
      payload: {
        email: "login@example.com",
        password: "SenhaErrada123!",
      },
    });
    const signInResponse = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      headers: {
        origin,
      },
      payload: {
        email: "login@example.com",
        password: "SenhaForte123!",
      },
    });

    expect(wrongPasswordResponse.statusCode).toBe(401);
    expect(signInResponse.statusCode).toBe(200);

    const signInCookie = signInResponse.cookies
      .map((item) => `${item.name}=${item.value}`)
      .join("; ");
    const sessionResponse = await app.inject({
      method: "GET",
      url: "/api/auth/get-session",
      headers: {
        cookie: signInCookie,
      },
    });

    expect(sessionResponse.statusCode).toBe(200);
    expect(
      (sessionResponse.json() as { user: { email: string } }).user.email,
    ).toBe("login@example.com");
  });

  it("rejeita cadastro duplicado", async () => {
    await signUp(app, "duplicate@example.com");

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      headers: {
        origin,
      },
      payload: {
        name: "Duplicate",
        email: "duplicate@example.com",
        password: "SenhaForte123!",
      },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
    });
  });

  it("expõe o OpenAPI do better-auth", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/auth/open-api/generate-schema",
    });

    expect(response.statusCode).toBe(200);

    const schema = response.json() as {
      openapi: string;
      paths: Record<string, unknown>;
    };

    expect(schema.openapi).toMatch(/^3\./);
    expect(
      Object.keys(schema.paths).some((path) => path.includes("sign-up")),
    ).toBe(true);
  });

  it("retorna 500 quando o handler de autenticação falha", async () => {
    const handlerSpy = vi
      .spyOn(auth, "handler")
      .mockRejectedValueOnce(new Error("auth failure"));

    try {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/get-session",
      });

      expect(response.statusCode).toBe(500);
      expect(response.json()).toEqual({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    } finally {
      handlerSpy.mockRestore();
    }
  });

  it("serve a rota raiz", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: "API rodando com sucesso!",
    });
  });

  it("serve o Scalar em /docs", async () => {
    const redirectResponse = await app.inject({
      method: "GET",
      url: "/docs",
    });
    const response = await app.inject({
      method: "GET",
      url: "/docs/",
    });

    expect(redirectResponse.statusCode).toBe(301);
    expect(redirectResponse.headers.location).toBe("/docs/");
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.body).toContain("Bootcamp Treinos API");
  });

  it("expõe o Swagger sem as rotas de auth", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/swagger.json",
    });

    expect(response.statusCode).toBe(200);

    const schema = response.json() as {
      info: {
        title: string;
      };
      paths: Record<string, unknown>;
    };

    expect(schema.info.title).toBe("Bootcamp Treinos API");
    expect(Object.keys(schema.paths)).toEqual(
      expect.arrayContaining([
        "/",
        "/workout-plans",
        "/workout-plans/{id}",
        "/workout-plans/{planId}/days",
        "/workout-plans/{planId}/days/{dayId}",
        "/workout-plans/{planId}/days/{dayId}/exercises",
        "/workout-plans/{planId}/days/{dayId}/exercises/{exerciseId}",
      ]),
    );
    expect(
      Object.keys(schema.paths).some((path) => path.startsWith("/api/auth")),
    ).toBe(false);
  });

  it("responde preflight CORS para origem permitida", async () => {
    const response = await app.inject({
      method: "OPTIONS",
      url: "/workout-plans",
      headers: {
        origin,
        "access-control-request-method": "GET",
        "access-control-request-headers": "content-type",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(origin);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["access-control-allow-methods"]).toContain("GET");
  });

  it("expõe X-Total-Count em resposta CORS", async () => {
    const cookie = await signUp(app, "cors@example.com");
    await createPlan(app, cookie);

    const response = await app.inject({
      method: "GET",
      url: "/workout-plans",
      headers: {
        cookie,
        origin,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(origin);
    expect(response.headers["access-control-expose-headers"]).toContain(
      "X-Total-Count",
    );
    expect(response.headers["x-total-count"]).toBe("1");
  });
});
