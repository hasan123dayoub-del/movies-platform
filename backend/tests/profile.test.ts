import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { adminToken, api, bearer, uniq } from "./helpers.js";

// A member of our own, so changing their name and password affects nobody else
const email = `profile-${uniq()}@example.com`;
let token = "";

beforeAll(async () => {
  token = (await api().post("/auth/register").send({ name: "Before", email, password: "first-pass" })).body.token;
});

describe("profile", () => {
  it("changes the name (trimmed), and checks it", async () => {
    const res = await api().put("/auth/me").set(bearer(token)).send({ name: "  After  " });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: "After", email });
    expect(res.body).not.toHaveProperty("passwordHash");
    expect((await api().put("/auth/me").set(bearer(token)).send({ name: "" })).status).toBe(400);
    expect((await api().put("/auth/me").send({ name: "X" })).status).toBe(401);
  });

  it("refuses a wrong current password, on its field", async () => {
    const res = await api()
      .put("/auth/me/password")
      .set(bearer(token))
      .send({ currentPassword: "wrong-one", newPassword: "second-pass" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "currentPassword", message: "Current password is incorrect" }]);
  });

  it("refuses a short new password, or the same one again", async () => {
    const short = await api().put("/auth/me/password").set(bearer(token)).send({ currentPassword: "first-pass", newPassword: "123" });
    expect(short.body.errors[0].field).toBe("newPassword");
    const same = await api().put("/auth/me/password").set(bearer(token)).send({ currentPassword: "first-pass", newPassword: "first-pass" });
    expect(same.body.errors[0].message).toBe("The new password must be different from the current one");
  });

  it("changes the password: the new one logs in, the old one doesn't", async () => {
    const res = await api().put("/auth/me/password").set(bearer(token)).send({ currentPassword: "first-pass", newPassword: "second-pass" });
    expect(res.status).toBe(204);
    expect((await api().post("/auth/login").send({ email, password: "second-pass" })).status).toBe(200);
    expect((await api().post("/auth/login").send({ email, password: "first-pass" })).status).toBe(401);
  });

  it("stops guessing the current password after 10 wrong tries (429)", async () => {
    const guesser = (await api().post("/auth/register").send({ name: "G", email: `guess-${uniq()}@example.com`, password: "real-pass" })).body.token;
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      statuses.push((await api().put("/auth/me/password").set(bearer(guesser)).send({ currentPassword: `guess-${i}`, newPassword: "whatever-1" })).status);
    }
    expect(statuses.slice(0, 10).every((s) => s === 400)).toBe(true);
    expect(statuses[10]).toBe(429);
  });
});

describe("my reviews", () => {
  let admin = "";
  let movieId = 0;
  let seriesId = 0;

  beforeAll(async () => {
    admin = await adminToken();
    movieId = (await api().post("/movies").set(bearer(admin)).send({ title: `Mine ${uniq()}`, type: "Drama", rating: 6, director: "T", releaseYear: 2021 })).body.id;
    seriesId = (await api().post("/series").set(bearer(admin)).send({ title: `Mine S ${uniq()}`, type: "Drama", rating: 6, creator: "T", startYear: 2021 })).body.id;
  });

  afterAll(async () => {
    await api().delete(`/movies/${movieId}`).set(bearer(admin));
    await api().delete(`/series/${seriesId}`).set(bearer(admin));
  });

  it("lists the member's reviews, the latest first, each with its title", async () => {
    expect((await api().get("/auth/me/reviews").set(bearer(token))).body.data).toEqual([]);
    await api().put(`/movies/${movieId}/reviews`).set(bearer(token)).send({ rating: 7 });
    await api().put(`/series/${seriesId}/reviews`).set(bearer(token)).send({ rating: 9, comment: "Loved it" });

    const res = await api().get("/auth/me/reviews").set(bearer(token));
    expect(res.body.meta.total).toBe(2);
    expect(res.body.data[0]).toMatchObject({ rating: 9, series: { id: seriesId }, movie: null });
    expect(res.body.data[1]).toMatchObject({ rating: 7, movie: { id: movieId }, series: null });
  });

  it("needs a login", async () => {
    expect((await api().get("/auth/me/reviews")).status).toBe(401);
  });
});
