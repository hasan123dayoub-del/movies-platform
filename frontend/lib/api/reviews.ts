import { cacheLife, cacheTag } from "next/cache";
import type { ReviewInput, Review, ReviewsPage, TitleKind, Watchlist } from "../types";
import {
  getJson,
  getJsonWithAuthOrNull,
  sendDelete,
  sendJson,
  sendWithoutBody,
} from "./client";

// /movies/3 or /series/3 on the API
const titlePath = (kind: TitleKind, id: number) => `/${kind === "movie" ? "movies" : "series"}/${id}`;

// Each title's reviews are cached on their own tag, so a new review refreshes only that
// title's reviews (not the whole catalog)
export const reviewsTag = (kind: TitleKind, id: number) => `reviews-${kind}-${id}`;

// The members' average, the count, and one page of reviews (the latest first)
export async function getReviews(kind: TitleKind, id: number, page = 1) {
  "use cache";
  cacheTag(reviewsTag(kind, id));
  cacheLife("catalog");
  return getJson<ReviewsPage>(`${titlePath(kind, id)}/reviews?page=${page}`, "Failed to load reviews");
}

// The visitor's own review, or null (not logged in, or no review yet). Never cached.
export function getMyReview(kind: TitleKind, id: number) {
  return getJsonWithAuthOrNull<Review>(`${titlePath(kind, id)}/reviews/me`, "Failed to load your review");
}

export function saveMyReview(kind: TitleKind, id: number, data: ReviewInput) {
  return sendJson<Review>("PUT", `${titlePath(kind, id)}/reviews`, data, "Failed to save your review");
}

export function deleteMyReview(kind: TitleKind, id: number) {
  return sendDelete(`${titlePath(kind, id)}/reviews`, "Failed to delete your review");
}

// Admins only: remove anyone's review
export function deleteReviewById(reviewId: number) {
  return sendDelete(`/reviews/${reviewId}`, "Failed to delete the review");
}

// The visitor's own watchlist, or null when not logged in. Never cached.
export function getWatchlist() {
  return getJsonWithAuthOrNull<Watchlist>("/watchlist", "Failed to load your watchlist");
}

export function addToWatchlist(kind: TitleKind, id: number) {
  return sendWithoutBody("PUT", `/watchlist${titlePath(kind, id)}`, "Failed to add to your watchlist");
}

export function removeFromWatchlist(kind: TitleKind, id: number) {
  return sendWithoutBody("DELETE", `/watchlist${titlePath(kind, id)}`, "Failed to remove from your watchlist");
}
