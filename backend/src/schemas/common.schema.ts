import { z } from "zod";

// ---------- Reusable field rules ----------

// A required piece of text, trimmed, with readable messages
export function requiredText(label: string, max = 100) {
  return z
    .string({
      error: (issue) =>
        issue.input === undefined ? `${label} is required` : `${label} must be text`,
    })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);
}

// An optional http(s) image link; null means "no image".
// exactOptional: the field may be missing, but if sent it must be a link or null (never undefined),
// which is what Prisma expects
export function optionalImageUrl(label: string) {
  return z
    .url({ protocol: /^https?$/, error: `${label} must be a valid http(s) link` })
    .nullable()
    .exactOptional();
}

// A whole number above zero, e.g. an id
export function positiveId(label: string) {
  return z
    .number({
      error: (issue) =>
        issue.input === undefined ? `${label} is required` : `${label} must be a number`,
    })
    .int(`${label} must be a whole number`)
    .positive(`${label} must be a positive number`);
}

// A rating out of 10 (movies and series)
export function ratingField() {
  return z
    .number({
      error: (issue) =>
        issue.input === undefined ? "Rating is required" : "Rating must be a number",
    })
    .min(0, "Rating can't be below 0")
    .max(10, "Rating can't be above 10");
}

// A year like 2010. The first film ever shown is from 1888; announced titles may be
// a few years ahead
export const FIRST_FILM_YEAR = 1888;
export function yearField(label: string) {
  return z
    .number({
      error: (issue) =>
        issue.input === undefined ? `${label} is required` : `${label} must be a number`,
    })
    .int(`${label} must be a whole year, like 2010`)
    .min(FIRST_FILM_YEAR, `${label} can't be before ${FIRST_FILM_YEAR}`)
    .refine((year) => year <= new Date().getFullYear() + 5, {
      error: `${label} is too far in the future`,
    });
}

// Optional free text, e.g. a description; null means "none"
export function optionalText(label: string, max = 1000) {
  return z
    .string({ error: `${label} must be text` })
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .nullable()
    .exactOptional();
}

// A text filter from the query string (?search=dark). An empty box ("?search=")
// counts as no filter, so the result is a string with something in it, or undefined.
export function optionalSearch(label: string) {
  return z
    .string({ error: `${label} must be text` })
    .trim()
    .max(100, `${label} must be at most 100 characters`)
    .optional()
    .transform((value) => value || undefined);
}

// Rejects an update body with no fields in it
export function atLeastOneField(data: object) {
  return Object.keys(data).length > 0;
}
export const atLeastOneFieldMessage = { error: "Send at least one field to update" };

// ---------- URL params ----------

// Params always arrive as text ("5"), so coerce turns them into numbers first
const idParam = (label: string) =>
  z.coerce
    .number({ error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .positive(`${label} must be a positive number`);

// /movies/:id and /actors/:id
export const idParams = z.object({ id: idParam("ID") });

// /movies/:id/actors/:actorId
export const castParams = z.object({
  id: idParam("Movie ID"),
  actorId: idParam("Actor ID"),
});

// ?page=2&perPage=12 on the list endpoints. Without page, the full list comes back.
// Query values arrive as text, so "2" is turned into the number 2 first.
export const pageFields = {
  page: z.coerce
    .number({ error: "Page must be a number" })
    .int("Page must be a whole number")
    .min(1, "Page must be 1 or more")
    .optional(),
  perPage: z.coerce
    .number({ error: "perPage must be a number" })
    .int("perPage must be a whole number")
    .min(1, "perPage must be 1 or more")
    .max(100, "perPage must be at most 100")
    .default(12),
};
