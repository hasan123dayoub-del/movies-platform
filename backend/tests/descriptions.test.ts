import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { adminToken, api, bearer, uniq } from "./helpers.js";
import { movies } from "../prisma/data/movies.js";
import { series } from "../prisma/data/series.js";
import { freeFilms } from "../prisma/data/media.js";
import { movieDescriptionsAr, seriesDescriptionsAr } from "../prisma/data/descriptions.js";

// Every summary in two languages: `description` (English) and `descriptionAr` (Arabic)
describe("Arabic descriptions", () => {
  let admin = "";
  let movieId = 0;
  let seriesId = 0;

  beforeAll(async () => {
    admin = await adminToken();
  });

  afterAll(async () => {
    if (movieId) await api().delete(`/movies/${movieId}`).set(bearer(admin));
    if (seriesId) await api().delete(`/series/${seriesId}`).set(bearer(admin));
  });

  it("every sample title has an Arabic summary, and each one belongs to a real title", () => {
    const movieTitles = [...movies, ...freeFilms].map((m) => m.title).sort();
    const seriesTitles = series.map((s) => s.title).sort();
    expect(Object.keys(movieDescriptionsAr).sort()).toEqual(movieTitles);
    expect(Object.keys(seriesDescriptionsAr).sort()).toEqual(seriesTitles);
  });

  it("every sample `description` is in English (no Arabic letters left in it)", () => {
    const arabic = /[؀-ۿ]/;
    const stillArabic = [...movies, ...freeFilms, ...series].filter((t) => arabic.test(t.description)).map((t) => t.title);
    expect(stillArabic).toEqual([]);
  });

  it("a movie keeps both summaries, and either can be changed or removed", async () => {
    const created = await api()
      .post("/movies")
      .set(bearer(admin))
      .send({
        title: `Bilingual ${uniq()}`, type: "Drama", rating: 7, director: "T", releaseYear: 2020,
        description: "A quiet story.", descriptionAr: "  قصة هادئة.  ",
      });
    expect(created.status).toBe(201);
    movieId = created.body.id;
    expect(created.body).toMatchObject({ description: "A quiet story.", descriptionAr: "قصة هادئة." });

    const read = await api().get(`/movies/${movieId}`);
    expect(read.body.descriptionAr).toBe("قصة هادئة.");

    const cleared = await api().put(`/movies/${movieId}`).set(bearer(admin)).send({ descriptionAr: null });
    expect(cleared.status).toBe(200);
    expect(cleared.body).toMatchObject({ description: "A quiet story.", descriptionAr: null });
  });

  it("a series keeps its Arabic summary too", async () => {
    const created = await api()
      .post("/series")
      .set(bearer(admin))
      .send({ title: `Bilingual ${uniq()}`, type: "Drama", rating: 8, creator: "T", startYear: 2020, descriptionAr: "مسلسل عن عائلة." });
    expect(created.status).toBe(201);
    seriesId = created.body.id;
    expect(created.body.descriptionAr).toBe("مسلسل عن عائلة.");
  });

  it("rejects an Arabic summary that is not text or far too long", async () => {
    const base = { title: `Bad ${uniq()}`, type: "Drama", rating: 7, director: "T", releaseYear: 2020 };
    const notText = await api().post("/movies").set(bearer(admin)).send({ ...base, descriptionAr: 5 });
    expect(notText.status).toBe(400);
    expect(JSON.stringify(notText.body)).toContain("Arabic description must be text");
    const tooLong = await api().post("/movies").set(bearer(admin)).send({ ...base, descriptionAr: "ب".repeat(1001) });
    expect(tooLong.status).toBe(400);
    expect(JSON.stringify(tooLong.body)).toContain("Arabic description must be at most 1000 characters");
  });
});
