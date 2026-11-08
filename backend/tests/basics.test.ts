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

  it("a body over 100kb gives 413", async () => {
    const res = await api().post("/auth/login").send({ email: "x".repeat(200_000) });
    expect(res.status).toBe(413);
  });
});
