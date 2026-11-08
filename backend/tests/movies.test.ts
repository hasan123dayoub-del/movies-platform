import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { adminToken, api, bearer, uniq } from "./helpers.js";

type Movie = { id: number; title: string; type: string; rating: number; releaseYear: number | null };

describe("movies: reading", () => {
  it("lists the seeded movies", async () => {
    const res = await api().get("/movies");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(35);
  });

  it("sort=rating puts the highest first", async () => {
    const movies: Movie[] = (await api().get("/movies?sort=rating")).body;
    movies.forEach((m, i) => i > 0 && expect(movies[i - 1]!.rating).toBeGreaterThanOrEqual(m.rating));
  });

  it("sort=newest puts the newest first", async () => {
    const years = ((await api().get("/movies?sort=newest")).body as Movie[])
      .map((m) => m.releaseYear)
      .filter((y): y is number => y !== null);
    years.forEach((y, i) => i > 0 && expect(years[i - 1]!).toBeGreaterThanOrEqual(y));
  });

  it("searches in Arabic", async () => {
    const res = await api().get("/movies").query({ search: "الر" });
    expect(res.body.some((m: Movie) => m.title === "الرسالة")).toBe(true);
  });

  it("combines search and type, any case", async () => {
    const movies: Movie[] = (await api().get("/movies?search=the&type=drama")).body;
    expect(movies.length).toBeGreaterThan(0);
    for (const m of movies) {
      expect(m.type).toBe("Drama");
      expect(m.title).toMatch(/the/i);
    }
  });

  it("rejects a bad sort, a bad id, and gives 404 for a missing movie", async () => {
    expect((await api().get("/movies?sort=bad")).status).toBe(400);
    expect((await api().get("/movies/abc")).status).toBe(400);
    expect((await api().get("/movies/999999")).status).toBe(404);
  });
});

describe("movies: admin writes and cast", () => {
  let admin = "";
  let movieId = 0;
  let actorId = 0;
  const title = `Test Movie ${uniq()}`;

  beforeAll(async () => {
    admin = await adminToken();
  });

  afterAll(async () => {
    // Clean up whatever this file created
    if (movieId) await api().delete(`/movies/${movieId}`).set(bearer(admin));
    if (actorId) await api().delete(`/actors/${actorId}`).set(bearer(admin));
  });

  it("reports every bad field", async () => {
    const res = await api()
      .post("/movies")
      .set(bearer(admin))
      .send({ title: "", type: "X", rating: 11, director: "", releaseYear: 1500, posterUrl: "ftp://x" });
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e: { field: string }) => e.field);
    expect(fields).toEqual(expect.arrayContaining(["title", "rating", "director", "releaseYear", "posterUrl"]));
  });

  it("creates a movie with trimmed text", async () => {
    const res = await api()
      .post("/movies")
      .set(bearer(admin))
      .send({ title: `  ${title} `, type: "Drama", rating: 7.5, director: "Tester", releaseYear: 2020, description: "  plot  " });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(title);
    expect(res.body.description).toBe("plot");
    movieId = res.body.id;
  });

  it("updates only the fields sent, and refuses an empty update", async () => {
    expect((await api().put(`/movies/${movieId}`).set(bearer(admin)).send({})).status).toBe(400);
    const res = await api().put(`/movies/${movieId}`).set(bearer(admin)).send({ rating: 8, description: null });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ rating: 8, description: null, title });
  });

  it("refuses an actor born in the future, then creates one", async () => {
    const bad = await api()
      .post("/actors")
      .set(bearer(admin))
      .send({ name: "Future Actor", birthday: "2999-01-01", nationality: "Test" });
    expect(bad.status).toBe(400);

    const name = `Test Actor ${uniq()}`;
    const res = await api().post("/actors").set(bearer(admin)).send({ name, birthday: "1990-02-03", nationality: "Test" });
    expect(res.status).toBe(201);
    expect(res.body.birthday).toMatch(/^1990-02-03/);
    actorId = res.body.id;

    const found = await api().get("/actors").query({ search: name.toLowerCase() });
    expect(found.body.map((a: { id: number }) => a.id)).toEqual([actorId]);
  });

  it("adds the actor to the cast once, then changes the role", async () => {
    const added = await api().post(`/movies/${movieId}/actors`).set(bearer(admin)).send({ actorId, role: "Lead" });
    expect(added.status).toBe(201);
    expect((await api().post(`/movies/${movieId}/actors`).set(bearer(admin)).send({ actorId, role: "Again" })).status).toBe(409);
    expect((await api().put(`/movies/${movieId}/actors/${actorId}`).set(bearer(admin)).send({ role: "" })).status).toBe(400);
    const changed = await api().put(`/movies/${movieId}/actors/${actorId}`).set(bearer(admin)).send({ role: "Hero" });
    expect(changed.body.role).toBe("Hero");
  });

  it("removes the actor from the cast, then deletes the movie", async () => {
    expect((await api().delete(`/movies/${movieId}/actors/${actorId}`).set(bearer(admin))).status).toBe(204);
    expect((await api().delete(`/movies/${movieId}`).set(bearer(admin))).status).toBe(204);
    expect((await api().get(`/movies/${movieId}`)).status).toBe(404);
    movieId = 0;
  });
});
