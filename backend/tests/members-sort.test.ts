import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { adminToken, api, bearer, uniq, userToken } from "./helpers.js";

type Item = { id: number; membersRating: number | null; reviewCount: number };

describe("members' rating in lists and ?sort=members", () => {
  let admin = "";
  let movieId = 0;
  const title = `Zzz Members ${uniq()}`;

  beforeAll(async () => {
    admin = await adminToken();
    // Last A to Z, but rated 10 by two members: ?sort=members must put it first
    movieId = (
      await api().post("/movies").set(bearer(admin)).send({ title, type: "Drama", rating: 1, director: "T", releaseYear: 2020 })
    ).body.id;
    for (let i = 0; i < 2; i++) {
      await api().put(`/movies/${movieId}/reviews`).set(bearer(await userToken())).send({ rating: 10 });
    }
  });

  afterAll(async () => {
    await api().delete(`/movies/${movieId}`).set(bearer(admin));
  });

  it("every list item has its members' average and review count", async () => {
    const movies: (Item & { title: string })[] = (await api().get("/movies")).body;
    const ours = movies.find((m) => m.id === movieId)!;
    expect(ours).toMatchObject({ membersRating: 10, reviewCount: 2 });
    const unrated = movies.find((m) => m.reviewCount === 0);
    expect(unrated?.membersRating).toBeNull();
    const series: Item[] = (await api().get("/series?page=1")).body.data;
    expect(series[0]).toHaveProperty("membersRating");
  });

  it("?sort=members: highest average first, unrated last, on every page", async () => {
    const all: Item[] = (await api().get("/movies?sort=members")).body;
    expect(all[0]!.id).toBe(movieId);
    const firstUnrated = all.findIndex((m) => m.membersRating === null);
    expect(all.slice(firstUnrated).every((m) => m.membersRating === null)).toBe(true);
    for (let i = 1; i < firstUnrated; i++) {
      expect(all[i - 1]!.membersRating!).toBeGreaterThanOrEqual(all[i]!.membersRating!);
    }

    // The pages follow the same order
    const page2 = (await api().get("/movies?sort=members&page=2&perPage=5")).body;
    expect(page2.data.map((m: Item) => m.id)).toEqual(all.slice(5, 10).map((m) => m.id));
    expect(page2.meta.total).toBe(all.length);
  });

  it("works for series and with a search", async () => {
    expect((await api().get("/series?sort=members")).status).toBe(200);
    const found = (await api().get("/movies").query({ sort: "members", search: "zzz members" })).body;
    expect(found[0].id).toBe(movieId);
  });
});
