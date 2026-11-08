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

// The state a form starts with before its first submit
export const emptyFormState: FormState = { errors: {}, values: {} };
