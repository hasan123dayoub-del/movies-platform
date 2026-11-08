import request from "supertest";
import app from "../src/app.js";

// Calls the app directly (no running server needed), like Laravel's $this->getJson(...)
export const api = () => request(app);

// A short random suffix, so every run creates its own rows and never clashes
export const uniq = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// The demo admin from the seed
export async function adminToken(): Promise<string> {
  const res = await api().post("/auth/login").send({ email: "admin@movies.dev", password: "admin1234" });
  return res.body.token;
}

// A brand-new normal user (role USER)
export async function userToken(): Promise<string> {
  const res = await api()
    .post("/auth/register")
    .send({ name: "Test User", email: `user-${uniq()}@example.com`, password: "secret123" });
  return res.body.token;
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
