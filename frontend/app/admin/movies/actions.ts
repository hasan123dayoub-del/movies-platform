"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createMovie, updateMovie, deleteMovie } from "@/lib/api";
import { CATALOG_TAG } from "@/lib/api/cache";
import { requireAdmin } from "@/lib/auth";
import { readText, emptyToNull, tmdbIdFrom } from "@/lib/form";
import type { FormState, MovieInput } from "@/lib/types";

// Every action starts with requireAdmin(): a Server Action can be called by anyone,
// not only from our admin pages. After a change, updateTag() drops the cached
// movie/actor data so every page shows the new version straight away.

// Reads the form fields; rating and release year are the ones the API wants as numbers
function readMovieForm(formData: FormData) {
  const values = {
    title: readText(formData, "title"),
    type: readText(formData, "type"),
    rating: readText(formData, "rating"),
    director: readText(formData, "director"),
    releaseYear: readText(formData, "releaseYear"),
    runtime: readText(formData, "runtime"),
    description: readText(formData, "description"),
    posterUrl: readText(formData, "posterUrl"),
    trailer: readText(formData, "trailer"),
    tmdb: readText(formData, "tmdb"),
    streamUrl: readText(formData, "streamUrl"),
  };

  const data = {
    title: values.title,
    type: values.type,
    // An empty box is "not sent", so the API answers "required" instead of "0"
    rating: values.rating === "" ? undefined : Number(values.rating),
    director: values.director,
    releaseYear: values.releaseYear === "" ? undefined : Number(values.releaseYear),
    // An empty box clears the runtime
    runtime: values.runtime === "" ? null : Number(values.runtime),
    // An empty box means "no description"
    description: emptyToNull(values.description),
    posterUrl: emptyToNull(values.posterUrl),
    // The API turns any YouTube link into the video id
    trailerYoutubeId: emptyToNull(values.trailer),
    tmdbId: tmdbIdFrom(values.tmdb),
    streamUrl: emptyToNull(values.streamUrl),
  } as MovieInput;

  return { values, data };
}

export async function createMovieAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { values, data } = readMovieForm(formData);

  const result = await createMovie(data);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  updateTag(CATALOG_TAG);
  // The cast needs the movie's id, so it's added on the edit page:
  // go straight there, scrolled down to the cast section
  redirect(`/admin/movies/${result.data.id}/edit#cast`);
}

export async function updateMovieAction(
  id: number,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { values, data } = readMovieForm(formData);

  const result = await updateMovie(id, data);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  updateTag(CATALOG_TAG);
  redirect("/admin/movies");
}

export async function deleteMovieAction(id: number) {
  await requireAdmin();
  await deleteMovie(id);
  updateTag(CATALOG_TAG);
}
