import { z } from "zod";
import {
  requiredText,
  optionalImageUrl,
  atLeastOneField,
  atLeastOneFieldMessage,
} from "./common.schema.js";

export const createMovieSchema = z.object({
  title: requiredText("Title", 200),
  type: requiredText("Type", 50),
  rating: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "Rating is required" : "Rating must be a number",
    })
    .min(0, "Rating can't be below 0")
    .max(10, "Rating can't be above 10"),
  director: requiredText("Director"),
  posterUrl: optionalImageUrl("Poster"),
});

export const updateMovieSchema = createMovieSchema
  .partial()
  .refine(atLeastOneField, atLeastOneFieldMessage);

// The validated body types, used by the service (no need to write them twice)
export type CreateMovieInput = z.infer<typeof createMovieSchema>;
// Any subset of the create fields
export type UpdateMovieInput = Partial<CreateMovieInput>;
