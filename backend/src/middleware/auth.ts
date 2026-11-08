import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../lib/http-error.js";
import { readToken } from "../lib/token.js";
import { findUserById } from "../services/auth.service.js";

// Like Laravel's auth:sanctum middleware.
// Reads "Authorization: Bearer <token>", checks it, and puts the user on req.user.
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Please log in first");
  }

  const userId = await readToken(token);
  // The user may have been deleted after the token was made
  const user = userId === null ? null : await findUserById(userId);
  if (!user) {
    throw new HttpError(401, "Your session has expired, please log in again");
  }

  req.user = user;
  next();
}

// Like a Laravel Gate/policy check: only admins may change the catalog.
// Use it after requireAuth.
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    throw new HttpError(403, "Only admins can do this");
  }
  next();
}

// Both together, for the routes that change data
export const adminOnly = [requireAuth, requireAdmin];
