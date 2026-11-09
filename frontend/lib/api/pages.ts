import { cacheLife, cacheTag } from "next/cache";
import type { Actor, Movie, MovieFilters, Page, SeriesFilters, SeriesListItem } from "../types";
import { getJson } from "./client";
import { CATALOG_TAG } from "./cache";
import { toQuery } from "./query";

// One page of each public list (12 cards = 3 rows of 4).
// The full lists (getMovies, getActors, ...) stay for the home page, the admin and dropdowns.
export const PER_PAGE = 12;

export async function getMoviesPage(filters: MovieFilters, page: number) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("catalog");
  const query = toQuery({ ...filters, page: String(page), perPage: String(PER_PAGE) });
  return getJson<Page<Movie>>(`/movies${query}`, "Failed to load movies");
}

export async function getSeriesPage(filters: SeriesFilters, page: number) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("catalog");
  const query = toQuery({ ...filters, page: String(page), perPage: String(PER_PAGE) });
  return getJson<Page<SeriesListItem>>(`/series${query}`, "Failed to load series");
}

export async function getActorsPage(search: string | undefined, page: number) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("catalog");
  const query = toQuery({ search, page: String(page), perPage: String(PER_PAGE) });
  return getJson<Page<Actor>>(`/actors${query}`, "Failed to load actors");
}
