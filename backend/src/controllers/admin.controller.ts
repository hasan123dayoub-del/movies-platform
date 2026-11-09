import type { Request, Response } from "express";
import { getStats } from "../services/stats.service.js";

// GET /admin/stats: the numbers for the admin dashboard
export async function stats(req: Request, res: Response) {
  res.json(await getStats());
}
