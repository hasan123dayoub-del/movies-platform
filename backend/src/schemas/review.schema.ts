import { z } from "zod";
import { pageFields } from "./common.schema.js";

// PUT /movies/:id/reviews (or /series/:id/reviews): the member's own review.
// Sending it again changes it; a member has one review per title.
export const saveReviewSchema = z.object({
  rating: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "Rating is required" : "Rating must be a number",
    })
    .int("Rating must be a whole number")
    .min(1, "Rating must be between 1 and 10")
    .max(10, "Rating must be between 1 and 10"),
  // Optional: a rating alone is fine. Empty text counts as no comment.
  comment: z
    .string({ error: "Comment must be text" })
    .trim()
    .max(1000, "Comment must be at most 1000 characters")
    .nullish()
    .transform((text) => text || null),
});

// GET /movies/:id/reviews?page=2 (newest first, 10 per page by default)
export const reviewListQuery = z.object({
  page: pageFields.page.default(1),
  perPage: pageFields.perPage.default(10),
});

export type SaveReviewInput = z.infer<typeof saveReviewSchema>;
export type ReviewListQuery = z.infer<typeof reviewListQuery>;
