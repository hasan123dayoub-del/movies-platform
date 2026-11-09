import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { adminToken, api, bearer, uniq } from "./helpers.js";

describe("trailers and streams", () => {
  let admin = "";
  let movieId = 0;
  let seriesId = 0;
  const base = { type: "Drama", rating: 7, director: "T", releaseYear: 2020 };

  beforeAll(async () => {
    admin = await adminToken();
  });

  afterAll(async () => {
    if (movieId) await api().delete(`/movies/${movieId}`).set(bearer(admin));
    if (seriesId) await api().delete(`/series/${seriesId}`).set(bearer(admin));
  });

  it("saves any YouTube link as the video id", async () => {
    const res = await api()
      .post("/movies")
      .set(bearer(admin))
      .send({ ...base, title: `Media ${uniq()}`, trailerYoutubeId: "https://www.youtube.com/watch?v=hEJnMQG9ev8&t=5" });
    expect(res.status).toBe(201);
    expect(res.body.trailerYoutubeId).toBe("hEJnMQG9ev8");
    movieId = res.body.id;

    const short = await api().put(`/movies/${movieId}`).set(bearer(admin)).send({ trailerYoutubeId: "https://youtu.be/s9APLXM9Ei8" });
    expect(short.body.trailerYoutubeId).toBe("s9APLXM9Ei8");
    const cleared = await api().put(`/movies/${movieId}`).set(bearer(admin)).send({ trailerYoutubeId: null });
    expect(cleared.body.trailerYoutubeId).toBeNull();
  });

  it("refuses something that isn't a YouTube video", async () => {
    const res = await api().put(`/movies/${movieId}`).set(bearer(admin)).send({ trailerYoutubeId: "https://vimeo.com/123" });
    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toEqual({ field: "trailerYoutubeId", message: "Trailer must be a YouTube link or video id" });
  });

  it("accepts only an https HLS playlist as a stream", async () => {
    const ok = await api().put(`/movies/${movieId}`).set(bearer(admin)).send({ streamUrl: "https://example.org/film/master.m3u8" });
    expect(ok.body.streamUrl).toBe("https://example.org/film/master.m3u8");
    for (const [streamUrl, message] of [
      ["http://example.org/film/master.m3u8", "Stream link must be an https link"],
      ["https://example.org/film.mp4", "Stream link must point to an HLS playlist (.m3u8)"],
    ]) {
      const res = await api().put(`/movies/${movieId}`).set(bearer(admin)).send({ streamUrl });
      expect(res.body.errors[0].message).toBe(message);
    }
  });

  it("a movie has a runtime in minutes", async () => {
    const ok = await api().put(`/movies/${movieId}`).set(bearer(admin)).send({ runtime: 148 });
    expect(ok.body.runtime).toBe(148);
    for (const [runtime, message] of [
      [0, "Runtime must be at least 1 minute"],
      [90.5, "Runtime must be a whole number of minutes"],
      ["2h", "Runtime must be a number of minutes"],
    ] as const) {
      const res = await api().put(`/movies/${movieId}`).set(bearer(admin)).send({ runtime });
      expect(res.status).toBe(400);
      expect(res.body.errors[0]).toEqual({ field: "runtime", message });
    }
    const cleared = await api().put(`/movies/${movieId}`).set(bearer(admin)).send({ runtime: null });
    expect(cleared.body.runtime).toBeNull();
  });

  it("series take a trailer too", async () => {
    const res = await api()
      .post("/series")
      .set(bearer(admin))
      .send({ title: `Media S ${uniq()}`, type: "Drama", rating: 7, creator: "T", startYear: 2020, trailerYoutubeId: "s9APLXM9Ei8" });
    expect(res.body.trailerYoutubeId).toBe("s9APLXM9Ei8");
    seriesId = res.body.id;
  });

  it("the seed added the free films with their streams", async () => {
    const movies: { title: string; streamUrl: string | null }[] = (await api().get("/movies")).body;
    const free = movies.filter((m) => m.streamUrl).map((m) => m.title);
    expect(free).toEqual(expect.arrayContaining(["Big Buck Bunny", "Caminandes 2: Gran Dillama"]));
  });

  it("the seed gave the films their runtimes", async () => {
    const movies: { title: string; runtime: number | null }[] = (await api().get("/movies")).body;
    const runtimeOf = (title: string) => movies.find((m) => m.title === title)?.runtime;
    expect(runtimeOf("Inception")).toBe(148);
    expect(runtimeOf("Big Buck Bunny")).toBe(11);
  });
});
