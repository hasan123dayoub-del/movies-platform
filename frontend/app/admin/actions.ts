"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createMovie, updateMovie, deleteMovie } from "@/lib/api";
import type { FieldErrors, MovieInput } from "@/lib/types";

// What the form gets back after a failed submit:
// the errors, and what the user typed so the inputs keep it
export type MovieFormState = {
  errors: FieldErrors;
  values: Record<string, string>;
};

// Reads the form fields; everything in FormData is text, so rating becomes a number
function readMovieForm(formData: FormData) {
  const values = {
    title: String(formData.get("title") ?? ""),
    type: String(formData.get("type") ?? ""),
    rating: String(formData.get("rating") ?? ""),
    director: String(formData.get("director") ?? ""),
    posterUrl: String(formData.get("posterUrl") ?? "").trim(),
  };

  const data = {
    title: values.title,
    type: values.type,
    // An empty box is "not sent", so the API answers "required" instead of "0"
    rating: values.rating === "" ? undefined : Number(values.rating),
    director: values.director,
    // An empty box means "no poster"
    posterUrl: values.posterUrl === "" ? null : values.posterUrl,
  } as MovieInput;

  return { values, data };
}

export async function createMovieAction(
  _prevState: MovieFormState,
  formData: FormData,
): Promise<MovieFormState> {
  const { values, data } = readMovieForm(formData);

  const result = await createMovie(data);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  redirect("/admin");
}

export async function updateMovieAction(
  id: number,
  _prevState: MovieFormState,
  formData: FormData,
): Promise<MovieFormState> {
  const { values, data } = readMovieForm(formData);

  const result = await updateMovie(id, data);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  redirect("/admin");
}

export async function deleteMovieAction(id: number) {
  await deleteMovie(id);
  refresh();
}
