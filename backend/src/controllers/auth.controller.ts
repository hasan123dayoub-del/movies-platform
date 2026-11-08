import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";

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
