import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import * as reviewsService from "../services/reviews.service.js";
import type { ReviewListQuery } from "../schemas/review.schema.js";

// POST /auth/register -> { user, token }
export async function register(req: Request, res: Response) {
  res.status(201).json(await authService.register(req.body));
}

// POST /auth/login -> { user, token }
export async function login(req: Request, res: Response) {
  res.json(await authService.login(req.body));
}

// GET /auth/me -> the logged-in user (requireAuth already loaded it)
export function me(req: Request, res: Response) {
  res.json(req.user);
}

// PUT /auth/me -> the user with the new name
export async function updateMe(req: Request, res: Response) {
  res.json(await authService.updateProfile(req.user!.id, req.body));
}

// PUT /auth/me/password -> 204
export async function changePassword(req: Request, res: Response) {
  await authService.changePassword(req.user!.id, req.body);
  res.status(204).end();
}

// GET /auth/me/reviews?page= -> the member's own reviews
export async function myReviews(req: Request, res: Response<unknown, { query: ReviewListQuery }>) {
  res.json(await reviewsService.listMyReviews(req.user!.id, res.locals.query));
}
