import type { Movie, MovieWithActors, MovieInput } from "../types";
import { getJson, getJsonOrNull, sendJson, sendDelete } from "./client";

export function getMovies() {
  return getJson<Movie[]>("/movies", "Failed to load movies");
}

export function getMovie(id: number) {
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
