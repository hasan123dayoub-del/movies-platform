import { Router } from "express";
import { reviewHandlers, deleteAnyReview } from "../controllers/reviews.controller.js";
import { getWatchlist, addHandler, removeHandler } from "../controllers/watchlist.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, adminOnly } from "../middleware/auth.js";
import { idParams } from "../schemas/common.schema.js";
import { reviewListQuery, saveReviewSchema } from "../schemas/review.schema.js";
import type { Title } from "../services/reviews.service.js";

// Reviews of one kind of title, mounted on the movies and series routers:
//   GET    /movies/:id/reviews      everyone: the average, the count and a page of reviews
//   GET    /movies/:id/reviews/me   members: their own review
//   PUT    /movies/:id/reviews      members: write or change their review
//   DELETE /movies/:id/reviews      members: delete their review
export function reviewRoutes(kind: Title["kind"]) {
  const reviews = reviewHandlers(kind);
  const router = Router();

  router.get("/:id/reviews", validate({ params: idParams, query: reviewListQuery }), reviews.list);
  router.get("/:id/reviews/me", requireAuth, validate({ params: idParams }), reviews.mine);
  router.put("/:id/reviews", requireAuth, validate({ params: idParams, body: saveReviewSchema }), reviews.save);
  router.delete("/:id/reviews", requireAuth, validate({ params: idParams }), reviews.remove);
  return router;
}

// /reviews/:id: admins can remove anyone's review
export const reviewsRouter = Router();
reviewsRouter.delete("/:id", adminOnly, validate({ params: idParams }), deleteAnyReview);

// /watchlist: each member's own list (any logged-in member, not only admins)
export const watchlistRouter = Router();
watchlistRouter.use(requireAuth);
watchlistRouter.get("/", getWatchlist);
watchlistRouter.put("/movies/:id", validate({ params: idParams }), addHandler("movie"));
watchlistRouter.delete("/movies/:id", validate({ params: idParams }), removeHandler("movie"));
watchlistRouter.put("/series/:id", validate({ params: idParams }), addHandler("series"));
watchlistRouter.delete("/series/:id", validate({ params: idParams }), removeHandler("series"));
