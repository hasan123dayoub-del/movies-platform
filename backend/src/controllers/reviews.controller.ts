import type { Request, Response } from "express";
import * as reviewsService from "../services/reviews.service.js";
import type { Title } from "../services/reviews.service.js";
import type { ReviewListQuery } from "../schemas/review.schema.js";

type Kind = Title["kind"];

// The same four handlers serve /movies/:id/reviews and /series/:id/reviews:
// reviewHandlers("movie") gives the movie versions.
export function reviewHandlers(kind: Kind) {
  const titleOf = (req: Request<{ id: string }>): Title => ({ kind, id: Number(req.params.id) });

  return {
    // GET /:id/reviews?page=
    async list(req: Request<{ id: string }>, res: Response<unknown, { query: ReviewListQuery }>) {
      res.json(await reviewsService.listReviews(titleOf(req), res.locals.query));
    },

    // GET /:id/reviews/me
    async mine(req: Request<{ id: string }>, res: Response) {
      res.json(await reviewsService.getMyReview(titleOf(req), req.user!.id));
    },

    // PUT /:id/reviews: 201 the first time, 200 when it changes an existing review
    async save(req: Request<{ id: string }>, res: Response) {
      const { review, created } = await reviewsService.saveMyReview(titleOf(req), req.user!.id, req.body);
      res.status(created ? 201 : 200).json(review);
    },

    // DELETE /:id/reviews
    async remove(req: Request<{ id: string }>, res: Response) {
      await reviewsService.deleteMyReview(titleOf(req), req.user!.id);
      res.status(204).end();
    },
  };
}

// DELETE /reviews/:id (admins)
export async function deleteAnyReview(req: Request<{ id: string }>, res: Response) {
  await reviewsService.deleteReview(Number(req.params.id));
  res.status(204).end();
}
