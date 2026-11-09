"use server";

import { refresh, updateTag } from "next/cache";
import {
  addToWatchlist,
  deleteMyReview,
  deleteReviewById,
  removeFromWatchlist,
  reviewsTag,
  saveMyReview,
} from "@/lib/api";
import { requireAdmin, requireUser } from "@/lib/auth";
import { readText } from "@/lib/form";
import type { FormState, TitleKind } from "@/lib/types";

// What every member action needs to know: which title, and which page to come back to
type Target = { kind: TitleKind; id: number; path: string };

// Write or change the visitor's review. Bound to its title in the page:
// saveReviewAction.bind(null, { kind: "movie", id: 3, path: "/movies/3" })
export async function saveReviewAction(
  target: Target,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser(target.path);
  const values = { rating: readText(formData, "rating"), comment: readText(formData, "comment") };

  const result = await saveMyReview(target.kind, target.id, {
    // An unpicked rating is sent as 0, so the API answers "Rating must be between 1 and 10"
    rating: Number(values.rating) || 0,
    comment: values.comment || null,
  });
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  // The average and the list change for everyone; the form shows the saved review
  updateTag(reviewsTag(target.kind, target.id));
  return { errors: {}, values: {} };
}

export async function deleteMyReviewAction(target: Target) {
  await requireUser(target.path);
  await deleteMyReview(target.kind, target.id);
  updateTag(reviewsTag(target.kind, target.id));
}

// Admins: remove someone else's review (e.g. a rude one)
export async function deleteReviewAsAdminAction(target: Target, reviewId: number) {
  await requireAdmin();
  await deleteReviewById(reviewId);
  updateTag(reviewsTag(target.kind, target.id));
}

// The watchlist button: add the title, or take it off if it's already there
export async function toggleWatchlistAction(target: Target, inWatchlist: boolean) {
  await requireUser(target.path);
  if (inWatchlist) {
    await removeFromWatchlist(target.kind, target.id);
  } else {
    await addToWatchlist(target.kind, target.id);
  }
  // The watchlist is never cached (it belongs to one visitor), so just redraw the page
  refresh();
}
