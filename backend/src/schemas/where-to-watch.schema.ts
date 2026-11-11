import { z } from "zod";

// GET /movies/:id/where-to-watch?country=SA
export const whereToWatchQuery = z.object({
  // A two-letter country code (ISO 3166-1), any case: "sa" and "SA" both work
  country: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Country must be a two-letter code like SA or US")
    .transform((code) => code.toUpperCase())
    .optional(),
});

export type WhereToWatchQuery = z.infer<typeof whereToWatchQuery>;
