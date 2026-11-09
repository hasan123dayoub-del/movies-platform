import { cacheLife, cacheTag } from "next/cache";
import type { Actor, ActorWithMovies, ActorInput } from "../types";
import { getJson, getJsonOrNull, sendJson, sendDelete } from "./client";
import { CATALOG_TAG } from "./cache";

// Cached reads, like in movies.ts

// Optional search: part of the name, any case
export async function getActors(search?: string) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("catalog");
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return getJson<Actor[]>(`/actors${query}`, "Failed to load actors");
}

export async function getActor(id: number) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("catalog");
  return getJsonOrNull<ActorWithMovies>(`/actors/${id}`, "Failed to load actor");
}

export function createActor(data: ActorInput) {
  return sendJson<Actor>("POST", "/actors", data, "Failed to create actor");
}

export function updateActor(id: number, data: Partial<ActorInput>) {
  return sendJson<Actor>("PUT", `/actors/${id}`, data, "Failed to update actor");
}

export function deleteActor(id: number) {
  return sendDelete(`/actors/${id}`, "Failed to delete actor");
}
