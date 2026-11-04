import type { Actor, ActorWithMovies, ActorInput } from "../types";
import { getJson, getJsonOrNull, sendJson, sendDelete } from "./client";

export function getActors() {
  return getJson<Actor[]>("/actors", "Failed to load actors");
}

export function getActor(id: number) {
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
