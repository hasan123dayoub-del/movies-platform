import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { adminToken, api, bearer, uniq, userToken } from "./helpers.js";

// A fresh movie and series for this file, so the counts start at zero
let admin = "";
let movieId = 0;
let seriesId = 0;

beforeAll(async () => {
  admin = await adminToken();
  movieId = (
    await api()
      .post("/movies")
      .set(bearer(admin))
      .send({ title: `Review Movie ${uniq()}`, type: "Drama", rating: 7, director: "Tester", releaseYear: 2020 })
  ).body.id;
  seriesId = (
    await api()
      .post("/series")
      .set(bearer(admin))
      .send({ title: `Review Series ${uniq()}`, type: "Drama", rating: 7, creator: "Tester", startYear: 2020 })
  ).body.id;
});

afterAll(async () => {
  await api().delete(`/movies/${movieId}`).set(bearer(admin));
  await api().delete(`/series/${seriesId}`).set(bearer(admin));
});

describe("reviews", () => {
  it("a title with no reviews has no average yet", async () => {
    const res = await api().get(`/movies/${movieId}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body.stats).toEqual({ average: null, count: 0 });
    expect(res.body.data).toEqual([]);
  });

  it("needs a login to write, and checks the rating", async () => {
    expect((await api().put(`/movies/${movieId}/reviews`).send({ rating: 8 })).status).toBe(401);
    const token = await userToken();
    for (const rating of [0, 11, 7.5, "8"]) {
      const res = await api().put(`/movies/${movieId}/reviews`).set(bearer(token)).send({ rating });
      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe("rating");
    }
  });

  it("writes a review once (201), then changes it (200), still one review", async () => {
    const token = await userToken();
    const first = await api().put(`/movies/${movieId}/reviews`).set(bearer(token)).send({ rating: 6, comment: "  Good  " });
    expect(first.status).toBe(201);
    expect(first.body).toMatchObject({ rating: 6, comment: "Good", user: { name: "Test User" } });
    expect(first.body.user).not.toHaveProperty("email");

    const again = await api().put(`/movies/${movieId}/reviews`).set(bearer(token)).send({ rating: 9, comment: "" });
    expect(again.status).toBe(200);
    expect(again.body).toMatchObject({ id: first.body.id, rating: 9, comment: null });

    const mine = await api().get(`/movies/${movieId}/reviews/me`).set(bearer(token));
    expect(mine.body.rating).toBe(9);
  });

  it("averages every member's rating to one decimal", async () => {
    for (const rating of [8, 9]) {
      await api().put(`/series/${seriesId}/reviews`).set(bearer(await userToken())).send({ rating });
    }
    await api().put(`/series/${seriesId}/reviews`).set(bearer(await userToken())).send({ rating: 9, comment: "Great" });
    const res = await api().get(`/series/${seriesId}/reviews`);
    expect(res.body.stats).toEqual({ average: 8.7, count: 3 });
    // The newest first
    expect(res.body.data[0].comment).toBe("Great");
  });

  it("pages the reviews", async () => {
    const res = await api().get(`/series/${seriesId}/reviews?page=2&perPage=2`);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toEqual({ page: 2, perPage: 2, total: 3, totalPages: 2 });
  });

  it("deletes your own review; then there is nothing to delete (404)", async () => {
    const token = await userToken();
    await api().put(`/movies/${movieId}/reviews`).set(bearer(token)).send({ rating: 5 });
    expect((await api().delete(`/movies/${movieId}/reviews`).set(bearer(token))).status).toBe(204);
    expect((await api().get(`/movies/${movieId}/reviews/me`).set(bearer(token))).status).toBe(404);
    expect((await api().delete(`/movies/${movieId}/reviews`).set(bearer(token))).status).toBe(404);
  });

  it("only admins can delete someone else's review", async () => {
    const token = await userToken();
    const review = (await api().put(`/movies/${movieId}/reviews`).set(bearer(token)).send({ rating: 2, comment: "Rude" })).body;
    expect((await api().delete(`/reviews/${review.id}`).set(bearer(await userToken()))).status).toBe(403);
    expect((await api().delete(`/reviews/${review.id}`).set(bearer(admin))).status).toBe(204);
    expect((await api().delete(`/reviews/${review.id}`).set(bearer(admin))).status).toBe(404);
  });

  it("gives 404 for reviews of a missing title", async () => {
    expect((await api().get("/movies/999999/reviews")).status).toBe(404);
    expect((await api().put("/series/999999/reviews").set(bearer(await userToken())).send({ rating: 5 })).status).toBe(404);
  });
});

describe("watchlist", () => {
  it("needs a login", async () => {
    expect((await api().get("/watchlist")).status).toBe(401);
  });

  it("adds movies and series (twice is fine), lists the latest first, removes them", async () => {
    const token = await userToken();
    expect((await api().get("/watchlist").set(bearer(token))).body).toEqual({ movies: [], series: [] });

    expect((await api().put(`/watchlist/movies/${movieId}`).set(bearer(token))).status).toBe(204);
    expect((await api().put(`/watchlist/movies/${movieId}`).set(bearer(token))).status).toBe(204);
    expect((await api().put(`/watchlist/series/${seriesId}`).set(bearer(token))).status).toBe(204);

    const list = (await api().get("/watchlist").set(bearer(token))).body;
    expect(list.movies.map((m: { id: number }) => m.id)).toEqual([movieId]);
    expect(list.series.map((s: { id: number }) => s.id)).toEqual([seriesId]);

    expect((await api().delete(`/watchlist/movies/${movieId}`).set(bearer(token))).status).toBe(204);
    expect((await api().get("/watchlist").set(bearer(token))).body.movies).toEqual([]);
  });

  it("each member sees only their own list", async () => {
    const mine = await userToken();
    await api().put(`/watchlist/movies/${movieId}`).set(bearer(mine));
    const other = (await api().get("/watchlist").set(bearer(await userToken()))).body;
    expect(other.movies).toEqual([]);
  });

  it("gives 404 for a missing title", async () => {
    expect((await api().put("/watchlist/movies/999999").set(bearer(await userToken()))).status).toBe(404);
  });
});
