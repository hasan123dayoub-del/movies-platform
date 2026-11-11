import { describe, it, expect } from "vitest";
import { api } from "./helpers.js";

describe("basics", () => {
  it("GET /health answers ok when the database is reachable", async () => {
    const res = await api().get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("unknown routes give a JSON 404", async () => {
    const res = await api().get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/);
  });

  it("sends security headers and hides Express", async () => {
    const res = await api().get("/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("broken JSON gives 400", async () => {
    const res = await api().post("/auth/login").set("Content-Type", "application/json").send("{broken");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid JSON in request body");
  });

  it("the front door points to the docs and the demo accounts", async () => {
    const res = await api().get("/");
    expect(res.body).toMatchObject({ docs: "/docs", openapi: "/openapi.json" });
    expect(res.body.demoAccounts).toHaveLength(2);
  });

  it("serves the OpenAPI document with every endpoint", async () => {
    const res = await api().get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.1.0");
    const operations = Object.values(res.body.paths as Record<string, object>).reduce(
      (n, methods) => n + Object.keys(methods).length,
      0,
    );
    // Every endpoint except "/" itself
    expect(operations).toBe(51);
    // Request bodies come from the Zod schemas: the rating rule is there
    const review = res.body.paths["/movies/{id}/reviews"].put.requestBody.content["application/json"].schema;
    expect(review.properties.rating).toMatchObject({ type: "integer", minimum: 1, maximum: 10 });
  });

  it("serves the Swagger UI page at /docs", async () => {
    const res = await api().get("/docs/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("swagger-ui");
  });

  it("a body over 100kb gives 413", async () => {
    const res = await api().post("/auth/login").send({ email: "x".repeat(200_000) });
    expect(res.status).toBe(413);
  });
});
