import { z } from "zod";
import {
  pageFields,
  requiredText,
  optionalImageUrl,
  optionalSearch,
  optionalText,
  ratingField,
  yearField,
  atLeastOneField,
  atLeastOneFieldMessage,
} from "./common.schema.js";

export const createMovieSchema = z.object({
  title: requiredText("Title", 200),
  type: requiredText("Type", 50),
  rating: ratingField(),
  director: requiredText("Director"),
  releaseYear: yearField("Release year"),
  description: optionalText("Description"),
  posterUrl: optionalImageUrl("Poster"),
});

export const updateMovieSchema = createMovieSchema
  .partial()
  .refine(atLeastOneField, atLeastOneFieldMessage);

// GET /movies?search=dark&type=Drama&sort=newest
export const MOVIE_SORTS = ["title", "rating", "newest"] as const;

export const movieListQuery = z.object({
  // Part of the title, any case
  search: optionalSearch("Search"),
  // An exact genre, e.g. "Sci-Fi"
  type: optionalSearch("Type"),
  sort: z
    .enum(MOVIE_SORTS, { error: `Sort must be one of: ${MOVIE_SORTS.join(", ")}` })
    .default("title"),
  ...pageFields,
});

// The validated body types, used by the service (no need to write them twice)
export type CreateMovieInput = z.infer<typeof createMovieSchema>;
// Any subset of the create fields
export type UpdateMovieInput = Partial<CreateMovieInput>;
export type MovieListQuery = z.infer<typeof movieListQuery>;
