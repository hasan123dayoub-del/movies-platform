import { describe, it, expect } from "vitest";
import { api } from "./helpers.js";

type Item = { id: number; title?: string; name?: string };

describe("pagination", () => {
  it("without ?page, the list endpoints still return the whole array", async () => {
    const res = await api().get("/movies");
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(35);
  });

  it("?page returns one page with its meta", async () => {
    const all: Item[] = (await api().get("/movies")).body;
    const res = await api().get("/movies?page=2&perPage=10");
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({
      page: 2,
      perPage: 10,
      total: all.length,
      totalPages: Math.ceil(all.length / 10),
    });
    // Page 2 is items 11 to 20 of the full list, in the same order
    expect(res.body.data.map((m: Item) => m.id)).toEqual(all.slice(10, 20).map((m) => m.id));
  });

  it("perPage defaults to 12", async () => {
    const res = await api().get("/actors?page=1");
    expect(res.body.meta.perPage).toBe(12);
    expect(res.body.data).toHaveLength(12);
  });

  it("the pages together hold every item exactly once", async () => {
    const first = (await api().get("/series?page=1&perPage=5")).body;
    const ids: number[] = [];
    for (let page = 1; page <= first.meta.totalPages; page++) {
      const res = await api().get(`/series?page=${page}&perPage=5`);
      ids.push(...res.body.data.map((s: Item) => s.id));
    }
    expect(ids).toHaveLength(first.meta.total);
    expect(new Set(ids).size).toBe(first.meta.total);
  });

  it("search results are ranked across pages: the best match is on page 1", async () => {
    const res = await api().get("/movies?search=the&page=1&perPage=3");
    expect(res.body.meta.total).toBeGreaterThan(3);
    // Titles that start with "the" come before titles that only contain it
    expect(res.body.data[0].title.toLowerCase().startsWith("the")).toBe(true);
  });

  it("a page past the end is empty, not an error", async () => {
    const res = await api().get("/movies?page=999");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("rejects bad page values", async () => {
    expect((await api().get("/movies?page=0")).status).toBe(400);
    expect((await api().get("/movies?page=abc")).status).toBe(400);
    expect((await api().get("/movies?page=1&perPage=500")).status).toBe(400);
  });
});
