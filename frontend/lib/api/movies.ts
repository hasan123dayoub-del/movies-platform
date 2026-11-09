import { cacheLife, cacheTag } from "next/cache";
import type { Movie, MovieFilters, MovieWithActors, MovieInput } from "../types";
import { getJson, getJsonOrNull, sendJson, sendDelete } from "./client";
import { CATALOG_TAG } from "./cache";
import { toQuery } from "./query";

// Reads are cached on the Next.js server ("use cache"), so pages don't wait for the API
// on every visit. Every admin change calls updateTag(CATALOG_TAG), which throws the
// cached copies away at once; changes made outside the site show up within minutes.

// Each combination of filters is cached on its own (the filters are part of the cache key)
export async function getMovies(filters: MovieFilters = {}) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("catalog");
  return getJson<Movie[]>(`/movies${toQuery(filters)}`, "Failed to load movies");
}


// Every genre already used, A to Z: suggested while typing a movie's type
export async function getGenres() {
  const movies = await getMovies();
  return [...new Set(movies.map((movie) => movie.type))].sort();
}

export async function getMovie(id: number) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("catalog");
  return getJsonOrNull<MovieWithActors>(`/movies/${id}`, "Failed to load movie");
}

export function createMovie(data: MovieInput) {
  return sendJson<Movie>("POST", "/movies", data, "Failed to create movie");
}

export function updateMovie(id: number, data: Partial<MovieInput>) {
  return sendJson<Movie>("PUT", `/movies/${id}`, data, "Failed to update movie");
}

export function deleteMovie(id: number) {
  return sendDelete(`/movies/${id}`, "Failed to delete movie");
}
