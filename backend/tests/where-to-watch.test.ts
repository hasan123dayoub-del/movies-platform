import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { adminToken, api, bearer, uniq } from "./helpers.js";

// TMDB is replaced by a fixed answer: the tests never call the real service
const tmdbAnswer = {
  id: 1,
  results: {
    SA: {
      link: "https://www.themoviedb.org/movie/1/watch?locale=SA",
      flatrate: [
        { provider_id: 2, provider_name: "Netflix", logo_path: "/netflix.jpg", display_priority: 5 },
        { provider_id: 1, provider_name: "Shahid VIP", logo_path: "/shahid.jpg", display_priority: 1 },
      ],
      rent: [{ provider_id: 3, provider_name: "Apple TV Store", logo_path: null, display_priority: 2 }],
    },
    US: {
      link: "https://www.themoviedb.org/movie/1/watch?locale=US",
      buy: [{ provider_id: 4, provider_name: "Amazon Video", logo_path: "/amazon.jpg", display_priority: 1 }],
    },
  },
};

function fakeTmdb(status = 200) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
    new Response(JSON.stringify(status === 200 ? tmdbAnswer : { status_message: "nope" }), {
      status,
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("where to watch", () => {
  let admin = "";
  const created: string[] = [];
  // A different TMDB id for each title, so the API's 12-hour memory never mixes them up
  let nextTmdbId = 900_000 + Math.floor(Math.random() * 90_000);

  async function movie(tmdbId: number | null) {
    const res = await api()
      .post("/movies")
      .set(bearer(admin))
      .send({ title: `Watch ${uniq()}`, type: "Drama", rating: 7, director: "T", releaseYear: 2020, tmdbId });
    created.push(`/movies/${res.body.id}`);
    return res.body.id as number;
  }

  beforeAll(async () => {
    admin = await adminToken();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  afterAll(async () => {
    for (const path of created) await api().delete(path).set(bearer(admin));
  });

  it("lists the offers in a country, in TMDB's order, with full logo links", async () => {
    const tmdbId = nextTmdbId++;
    const id = await movie(tmdbId);
    const fetch = fakeTmdb();

    const res = await api().get(`/movies/${id}/where-to-watch?country=sa`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      country: "SA",
      countries: ["SA", "US"],
      link: "https://www.themoviedb.org/movie/1/watch?locale=SA",
      stream: [
        { id: 1, name: "Shahid VIP", logo: "https://image.tmdb.org/t/p/w92/shahid.jpg" },
        { id: 2, name: "Netflix", logo: "https://image.tmdb.org/t/p/w92/netflix.jpg" },
      ],
      free: [],
      ads: [],
      rent: [{ id: 3, name: "Apple TV Store", logo: null }],
      buy: [],
    });
    // the token goes in the header, never in the address
    const [url, init] = fetch.mock.calls[0]!;
    expect(String(url)).toBe(`https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers`);
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer test-tmdb-token");
  });

  it("answers for the US when no country is given or it has no offers, and asks TMDB only once", async () => {
    const id = await movie(nextTmdbId++);
    const fetch = fakeTmdb();

    for (const query of ["", "?country=ZZ"]) {
      const res = await api().get(`/movies/${id}/where-to-watch${query}`);
      expect(res.body.country).toBe("US");
      expect(res.body.buy[0].name).toBe("Amazon Video");
    }
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("asks for a series under /tv", async () => {
    const res = await api()
      .post("/series")
      .set(bearer(admin))
      .send({ title: `Watch S ${uniq()}`, type: "Drama", rating: 7, creator: "T", startYear: 2020, tmdbId: nextTmdbId });
    created.push(`/series/${res.body.id}`);
    const fetch = fakeTmdb();

    const watch = await api().get(`/series/${res.body.id}/where-to-watch?country=SA`);
    expect(watch.body.stream).toHaveLength(2);
    expect(String(fetch.mock.calls[0]![0])).toBe(`https://api.themoviedb.org/3/tv/${nextTmdbId++}/watch/providers`);
  });

  it("a title without a TMDB id has no offers, without asking TMDB", async () => {
    const id = await movie(null);
    const fetch = fakeTmdb();

    const res = await api().get(`/movies/${id}/where-to-watch?country=SA`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ country: "SA", countries: [], link: null, stream: [], rent: [], buy: [] });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refuses a country that isn't a two-letter code", async () => {
    const id = await movie(null);
    const res = await api().get(`/movies/${id}/where-to-watch?country=Saudi`);
    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toEqual({ field: "country", message: "Country must be a two-letter code like SA or US" });
  });

  it("404 for a missing title, 502 when TMDB fails", async () => {
    expect((await api().get("/movies/999999999/where-to-watch")).status).toBe(404);

    const id = await movie(nextTmdbId++);
    fakeTmdb(500);
    const res = await api().get(`/movies/${id}/where-to-watch`);
    expect(res.status).toBe(502);
    expect(res.body.message).toBe("Couldn't reach TMDB, please try again");
  });

  it("the seed gave the catalog its TMDB ids", async () => {
    const movies: { title: string; tmdbId: number | null }[] = (await api().get("/movies")).body;
    expect(movies.find((m) => m.title === "Inception")?.tmdbId).toBe(27205);
  });
});
