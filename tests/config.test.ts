import { describe, expect, it } from "vitest";

import { parseOrigins } from "../src/lib/config.js";

describe("parseOrigins", () => {
  it("normaliza a origem padrão", () => {
    expect(parseOrigins(undefined, "http://localhost:3000/")).toEqual([
      "http://localhost:3000",
    ]);
  });

  it("separa, remove espaços e deduplica origens", () => {
    expect(
      parseOrigins(
        " http://localhost:3000 , https://app.example.com, http://localhost:3000/ ",
        "http://fallback",
      ),
    ).toEqual(["http://localhost:3000", "https://app.example.com"]);
  });

  it("usa o fallback quando o valor é vazio", () => {
    expect(parseOrigins("   ", "https://fallback.example.com/")).toEqual([
      "https://fallback.example.com",
    ]);
  });

  it("preserva esquemas não HTTP", () => {
    expect(parseOrigins("exp://192.168.0.10:8081")).toEqual([
      "exp://192.168.0.10:8081",
    ]);
  });

  it("rejeita wildcard com credenciais", () => {
    expect(() => parseOrigins("*")).toThrow(
      "Wildcard origins are not allowed when credentials are enabled",
    );
  });
});
