import type { MyReview, Page, User } from "../types";
import { getJsonWithAuthOrNull, sendJson } from "./client";

// The logged-in member's own account. Sent with their token, never cached.

export function updateMyName(name: string) {
  return sendJson<User>("PUT", "/auth/me", { name }, "Failed to save your name");
}

export function changeMyPassword(currentPassword: string, newPassword: string) {
  return sendJson<undefined>("PUT", "/auth/me/password", { currentPassword, newPassword }, "Failed to change your password");
}

export function getMyReviews(page = 1) {
  return getJsonWithAuthOrNull<Page<MyReview>>(`/auth/me/reviews?page=${page}`, "Failed to load your reviews");
}
