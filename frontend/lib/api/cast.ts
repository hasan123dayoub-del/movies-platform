import type { CastMember, CastInput } from "../types";
import { sendJson, sendDelete } from "./client";

// The cast lives under its movie: /movies/:id/actors/:actorId

export function addActorToMovie(movieId: number, data: CastInput) {
  return sendJson<CastMember>(
    "POST",
    `/movies/${movieId}/actors`,
    data,
    "Failed to add the actor to the movie",
  );
}

export function updateActorRole(movieId: number, actorId: number, role: string) {
  return sendJson<CastMember>(
    "PUT",
    `/movies/${movieId}/actors/${actorId}`,
    { role },
    "Failed to update the role",
  );
}

export function removeActorFromMovie(movieId: number, actorId: number) {
  return sendDelete(
    `/movies/${movieId}/actors/${actorId}`,
    "Failed to remove the actor from the movie",
  );
}
