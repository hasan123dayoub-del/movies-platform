"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createActor, updateActor, deleteActor } from "@/lib/api";
import { CATALOG_TAG } from "@/lib/api/cache";
import { requireAdmin } from "@/lib/auth";
import { readText, emptyToUndefined, emptyToNull } from "@/lib/form";
import type { FormState, ActorInput } from "@/lib/types";

// Same rules as the movie actions: check the admin first, drop the cache after a change

// Reads the form fields; <input type="date"> already gives "YYYY-MM-DD",
// and the API turns it into a date, so no conversion here
function readActorForm(formData: FormData) {
  const values = {
    name: readText(formData, "name"),
    birthday: readText(formData, "birthday"),
    nationality: readText(formData, "nationality"),
    photoUrl: readText(formData, "photoUrl"),
  };

  const data = {
    name: values.name,
    // "required" instead of "invalid date" when the box is empty
    birthday: emptyToUndefined(values.birthday),
    nationality: values.nationality,
    photoUrl: emptyToNull(values.photoUrl),
  } as ActorInput;

  return { values, data };
}

export async function createActorAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { values, data } = readActorForm(formData);

  const result = await createActor(data);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  updateTag(CATALOG_TAG);
  redirect("/admin/actors");
}

export async function updateActorAction(
  id: number,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { values, data } = readActorForm(formData);

  const result = await updateActor(id, data);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  updateTag(CATALOG_TAG);
  redirect("/admin/actors");
}

export async function deleteActorAction(id: number) {
  await requireAdmin();
  await deleteActor(id);
  updateTag(CATALOG_TAG);
}
