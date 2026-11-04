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
