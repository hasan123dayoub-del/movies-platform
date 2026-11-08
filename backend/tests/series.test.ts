import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { adminToken, api, bearer, uniq } from "./helpers.js";

type SeriesItem = { id: number; title: string; seasonCount: number; episodeCount: number };
type Season = { number: number; episodes: { number: number }[] };

describe("series: reading", () => {
  it("lists every series with season and episode counts", async () => {
    const list: SeriesItem[] = (await api().get("/series")).body;
    expect(list.length).toBeGreaterThanOrEqual(16);
    expect(list.reduce((n, s) => n + s.episodeCount, 0)).toBeGreaterThanOrEqual(1042);

    const friends = list.find((s) => s.title === "Friends");
    expect(friends).toMatchObject({ seasonCount: 10, episodeCount: 236 });
  });

  it("returns seasons and episodes in order", async () => {
    const list: SeriesItem[] = (await api().get("/series")).body;
    const friends = list.find((s) => s.title === "Friends")!;
    const seasons: Season[] = (await api().get(`/series/${friends.id}`)).body.seasons;
    seasons.forEach((season, i) => {
      expect(season.number).toBe(i + 1);
      season.episodes.forEach((e, j) => expect(e.number).toBe(j + 1));
    });
  });
});

describe("series: admin writes", () => {
  let admin = "";
  let seriesId = 0;
  let seasonId = 0;
  let episodeId = 0;
  let actorId = 0;

  beforeAll(async () => {
    admin = await adminToken();
  });

  afterAll(async () => {
    // Clean up whatever this file created
    if (seriesId) await api().delete(`/series/${seriesId}`).set(bearer(admin));
    if (actorId) await api().delete(`/actors/${actorId}`).set(bearer(admin));
  });

  it("refuses a series that ends before it starts", async () => {
    const res = await api()
      .post("/series")
      .set(bearer(admin))
      .send({ title: "S", type: "Drama", rating: 5, creator: "C", startYear: 2020, endYear: 2010 });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe("endYear");
  });

  it("creates an ongoing series, and checks endYear against the saved startYear", async () => {
    const res = await api()
      .post("/series")
      .set(bearer(admin))
      .send({ title: `Test Series ${uniq()}`, type: "Drama", rating: 8, creator: "Tester", startYear: 2020, endYear: null });
    expect(res.status).toBe(201);
    expect(res.body.endYear).toBeNull();
    seriesId = res.body.id;

    expect((await api().put(`/series/${seriesId}`).set(bearer(admin)).send({ endYear: 2000 })).status).toBe(400);
  });

  it("adds a season once (409 on the same number)", async () => {
    const res = await api()
      .post(`/series/${seriesId}/seasons`)
      .set(bearer(admin))
      .send({ number: 1, title: "One", releaseYear: 2020 });
    expect(res.status).toBe(201);
    seasonId = res.body.id;
    expect((await api().post(`/series/${seriesId}/seasons`).set(bearer(admin)).send({ number: 1 })).status).toBe(409);
  });

  it("adds, validates and edits episodes", async () => {
    const res = await api()
      .post(`/seasons/${seasonId}/episodes`)
      .set(bearer(admin))
      .send({ number: 1, title: "Pilot", airDate: "2020-01-05", runtime: 50, description: "x" });
    expect(res.status).toBe(201);
    expect(res.body.airDate).toMatch(/^2020-01-05/);
    episodeId = res.body.id;

    const dup = await api().post(`/seasons/${seasonId}/episodes`).set(bearer(admin)).send({ number: 1, title: "Dup" });
    expect(dup.status).toBe(409);

    const bad = await api()
      .post(`/seasons/${seasonId}/episodes`)
      .set(bearer(admin))
      .send({ number: 0, title: "", airDate: "x", runtime: 0 });
    expect(bad.status).toBe(400);
    expect(bad.body.errors.length).toBeGreaterThanOrEqual(4);

    const edited = await api().put(`/episodes/${episodeId}`).set(bearer(admin)).send({ title: "Pilot (edited)", runtime: null });
    expect(edited.body).toMatchObject({ title: "Pilot (edited)", runtime: null });
  });

  it("shows an actor's series on the actor page", async () => {
    const actor = await api()
      .post("/actors")
      .set(bearer(admin))
      .send({ name: `Series Actor ${uniq()}`, birthday: "1985-05-05", nationality: "Test" });
    actorId = actor.body.id;
    expect((await api().post(`/series/${seriesId}/actors`).set(bearer(admin)).send({ actorId, role: "Star" })).status).toBe(201);
    expect((await api().get(`/actors/${actorId}`)).body.series).toHaveLength(1);
  });

  it("deleting a season deletes its episodes too", async () => {
    expect((await api().delete(`/seasons/${seasonId}`).set(bearer(admin))).status).toBe(204);
    expect((await api().put(`/episodes/${episodeId}`).set(bearer(admin)).send({ title: "x" })).status).toBe(404);
  });
});
