"use server";

import { updateTag } from "next/cache";
import { addActorToMovie, updateActorRole, removeActorFromMovie } from "@/lib/api";
import { CATALOG_TAG } from "@/lib/api/cache";
import { requireAdmin } from "@/lib/auth";
import { readText, emptyFormState } from "@/lib/form";
import type { CastInput, FormState } from "@/lib/types";

// Unlike the movie form, these don't redirect: we stay on the edit page.
// updateTag() drops the cached data, and Next sends the fresh page back with the answer.

export async function addCastAction(
  movieId: number,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = {
    actorId: readText(formData, "actorId"),
    role: readText(formData, "role"),
  };

  const result = await addActorToMovie(movieId, {
    // No actor picked is "not sent", so the API answers "required"
    actorId: values.actorId === "" ? undefined : Number(values.actorId),
    role: values.role,
  } as CastInput);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  updateTag(CATALOG_TAG);
  // Empty values, so the form starts clean for the next actor
  return emptyFormState;
}

export async function updateRoleAction(
  movieId: number,
  actorId: number,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = { role: readText(formData, "role") };

  const result = await updateActorRole(movieId, actorId, values.role);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  updateTag(CATALOG_TAG);
  // Empty values, so the input shows the saved role from the fresh page data
  return emptyFormState;
}

export async function removeCastAction(movieId: number, actorId: number) {
  await requireAdmin();
  await removeActorFromMovie(movieId, actorId);
  updateTag(CATALOG_TAG);
}
