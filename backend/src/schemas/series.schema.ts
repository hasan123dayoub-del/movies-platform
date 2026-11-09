import { z } from "zod";
import {
  pageFields,
  requiredText,
  optionalImageUrl,
  optionalSearch,
  optionalText,
  positiveId,
  ratingField,
  yearField,
  atLeastOneField,
  atLeastOneFieldMessage,
} from "./common.schema.js";

// ---------- Series ----------

const seriesFields = {
  title: requiredText("Title", 200),
  type: requiredText("Type", 50),
  rating: ratingField(),
  creator: requiredText("Creator"),
  startYear: yearField("First year"),
  // null = still running
  endYear: yearField("Last year").nullable().exactOptional(),
  description: optionalText("Description"),
  posterUrl: optionalImageUrl("Poster"),
};

// A series can't end before it starts
const endsAfterStart = (data: { startYear?: number | undefined; endYear?: number | null | undefined }) =>
  data.startYear === undefined || data.endYear == null || data.endYear >= data.startYear;
const endsAfterStartMessage = {
  error: "Last year can't be before the first year",
  path: ["endYear"],
};

export const createSeriesSchema = z
  .object(seriesFields)
  .refine(endsAfterStart, endsAfterStartMessage);

// On update the other year may come from the database, so the service checks the pair again
export const updateSeriesSchema = z
  .object(seriesFields)
  .partial()
  .refine(atLeastOneField, atLeastOneFieldMessage)
  .refine(endsAfterStart, endsAfterStartMessage);

// GET /series?search=bad&type=Drama&sort=newest (newest = most recent first year)
export const SERIES_SORTS = ["title", "rating", "newest"] as const;

export const seriesListQuery = z.object({
  search: optionalSearch("Search"),
  type: optionalSearch("Type"),
  sort: z
    .enum(SERIES_SORTS, { error: `Sort must be one of: ${SERIES_SORTS.join(", ")}` })
    .default("title"),
  ...pageFields,
});

// ---------- Seasons ----------

export const createSeasonSchema = z.object({
  number: positiveId("Season number"),
  title: optionalText("Season title", 200),
  releaseYear: yearField("Release year").nullable().exactOptional(),
  description: optionalText("Description"),
  posterUrl: optionalImageUrl("Poster"),
});

export const updateSeasonSchema = createSeasonSchema
  .partial()
  .refine(atLeastOneField, atLeastOneFieldMessage);

// ---------- Episodes ----------

export const createEpisodeSchema = z.object({
  number: positiveId("Episode number"),
  title: requiredText("Title", 200),
  // "YYYY-MM-DD" in, a Date out (like an actor's birthday), or null for "unknown"
  airDate: z.iso
    .date({ error: "Air date must be a date like 2008-01-20" })
    .transform((value) => new Date(value))
    .nullable()
    .exactOptional(),
  runtime: z
    .number({ error: "Runtime must be a number of minutes" })
    .int("Runtime must be a whole number of minutes")
    .min(1, "Runtime must be at least 1 minute")
    .max(600, "Runtime can't be more than 600 minutes")
    .nullable()
    .exactOptional(),
  description: optionalText("Description"),
});

export const updateEpisodeSchema = createEpisodeSchema
  .partial()
  .refine(atLeastOneField, atLeastOneFieldMessage);

export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;
export type UpdateSeriesInput = Partial<CreateSeriesInput>;
export type SeriesListQuery = z.infer<typeof seriesListQuery>;
export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
export type UpdateSeasonInput = Partial<CreateSeasonInput>;
export type CreateEpisodeInput = z.infer<typeof createEpisodeSchema>;
export type UpdateEpisodeInput = Partial<CreateEpisodeInput>;
