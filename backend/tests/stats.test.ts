import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { adminToken, api, bearer, uniq, userToken } from "./helpers.js";

describe("admin stats", () => {
  let admin = "";
  let movieId = 0;

  beforeAll(async () => {
    admin = await adminToken();
    // A new movie rated 10 by two new members and saved by both: it must top both lists
    movieId = (
      await api()
        .post("/movies")
        .set(bearer(admin))
        .send({ title: `Stats Movie ${uniq()}`, type: "Drama", rating: 5, director: "Tester", releaseYear: 2020 })
    ).body.id;
    for (let i = 0; i < 2; i++) {
      const token = await userToken();
      await api().put(`/movies/${movieId}/reviews`).set(bearer(token)).send({ rating: 10, comment: "Perfect" });
      await api().put(`/watchlist/movies/${movieId}`).set(bearer(token));
    }
    // ...and saved by enough other members to be the most saved title
    for (let i = 0; i < 4; i++) {
      await api().put(`/watchlist/movies/${movieId}`).set(bearer(await userToken()));
    }
  });

  afterAll(async () => {
    await api().delete(`/movies/${movieId}`).set(bearer(admin));
  });

  it("is for admins only", async () => {
    expect((await api().get("/admin/stats")).status).toBe(401);
    expect((await api().get("/admin/stats").set(bearer(await userToken()))).status).toBe(403);
  });

  it("counts everything", async () => {
    const { counts } = (await api().get("/admin/stats").set(bearer(admin))).body;
    expect(counts.movies).toBeGreaterThanOrEqual(36);
    expect(counts.series).toBeGreaterThanOrEqual(16);
    expect(counts.episodes).toBeGreaterThanOrEqual(1042);
    expect(counts.reviews).toBeGreaterThanOrEqual(2);
    expect(counts.admins).toBeGreaterThanOrEqual(1);
  });

  it("puts the 10/10 movie at the top of the members' ratings and the most saved", async () => {
    const stats = (await api().get("/admin/stats").set(bearer(admin))).body;
    expect(stats.topRated[0]).toMatchObject({ kind: "movie", id: movieId, average: 10 });
    expect(stats.topRated[0].reviews).toBeGreaterThanOrEqual(2);
    expect(stats.mostSaved[0]).toMatchObject({ kind: "movie", id: movieId });
    expect(stats.mostSaved[0].saves).toBeGreaterThanOrEqual(6);
  });

  it("lists the latest reviews with their title, and the newest members", async () => {
    const stats = (await api().get("/admin/stats").set(bearer(admin))).body;
    expect(stats.latestReviews[0]).toMatchObject({ rating: 10, title: { kind: "movie", id: movieId } });
    expect(stats.latestReviews[0].user).not.toHaveProperty("email");
    expect(stats.newestMembers.length).toBeGreaterThan(0);
    expect(stats.newestMembers[0]).toHaveProperty("saved");
  });
});
