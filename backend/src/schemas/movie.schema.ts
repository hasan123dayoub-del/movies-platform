import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().trim().min(1),
  type: z.string().trim().min(1),
  rating: z.number().min(0).max(10),
  director: z.string().trim().min(1),
  posterUrl: z.url().nullable().optional(),
});

export const updateMovieSchema = createMovieSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Send at least one field to update",
  });
