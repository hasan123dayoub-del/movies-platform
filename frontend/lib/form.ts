import type { FormState } from "./types";

// Helpers shared by the Server Actions that read forms

// Everything in FormData is text (or missing): always get a trimmed string back
export function readText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

// An empty box means "not sent", so the API answers "X is required"
export function emptyToUndefined(value: string) {
  return value === "" ? undefined : value;
}

// An empty box on an optional field means "nothing", e.g. no poster
export function emptyToNull(value: string) {
  return value === "" ? null : value;
}

// The TMDB box takes the id (27205) or a TMDB link (themoviedb.org/movie/27205-inception).
// Anything else goes to the API as it is, which answers "TMDB id must be a number".
export function tmdbIdFrom(value: string): number | string | null {
  if (value === "") return null;
  const id = value.match(/^\d+$/)?.[0] ?? value.match(/themoviedb\.org\/(?:movie|tv)\/(\d+)/)?.[1];
  return id ? Number(id) : value;
}

// The state a form starts with before its first submit
export const emptyFormState: FormState = { errors: {}, values: {} };
