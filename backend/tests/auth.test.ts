import { describe, it, expect } from "vitest";
import { api, bearer, uniq, userToken } from "./helpers.js";

describe("auth", () => {
  const email = `auth-${uniq()}@Example.com`;
  let token = "";

  it("registers a user: email trimmed and lowercased, role USER, no password hash", async () => {
    const res = await api().post("/auth/register").send({ name: "Tester", email: ` ${email} `, password: "secret123" });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email.toLowerCase());
    expect(res.body.user.role).toBe("USER");
    expect(res.body.user).not.toHaveProperty("passwordHash");
    token = res.body.token;
  });

  it("refuses the same email twice (409)", async () => {
    const res = await api().post("/auth/register").send({ name: "Again", email, password: "secret123" });
    expect(res.status).toBe(409);
  });

  it("reports every invalid field", async () => {
    const res = await api().post("/auth/register").send({ email: "bad", password: "123" });
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e: { field: string }) => e.field);
    expect(fields).toEqual(expect.arrayContaining(["name", "email", "password"]));
  });

  it("gives the same 401 message for a wrong password and an unknown email", async () => {
    const wrong = await api().post("/auth/login").send({ email, password: "wrong-pass" });
    const unknown = await api().post("/auth/login").send({ email: `nobody-${uniq()}@x.com`, password: "wrong-pass" });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  it("GET /auth/me needs a valid token", async () => {
    expect((await api().get("/auth/me").set(bearer(token))).body.email).toBe(email.toLowerCase());
    expect((await api().get("/auth/me")).status).toBe(401);
    expect((await api().get("/auth/me").set(bearer(token + "x"))).status).toBe(401);
  });

  it("blocks login after 10 failed attempts for the same email (429)", async () => {
    const target = `limit-${uniq()}@example.com`;
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      statuses.push((await api().post("/auth/login").send({ email: target, password: "nope-nope" })).status);
    }
    expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true);
    expect(statuses[10]).toBe(429);
  });
});

describe("permissions", () => {
  it("anonymous writes get 401", async () => {
    expect((await api().post("/movies").send({})).status).toBe(401);
  });

  it("a normal USER can't write (403)", async () => {
    const token = await userToken();
    expect((await api().post("/movies").set(bearer(token)).send({})).status).toBe(403);
    expect((await api().delete("/series/1").set(bearer(token))).status).toBe(403);
    expect((await api().post("/seasons/1/episodes").set(bearer(token)).send({})).status).toBe(403);
  });
});
