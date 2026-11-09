import type { Request, Response } from "express";
import * as watchlistService from "../services/watchlist.service.js";
import type { Title } from "../services/reviews.service.js";

// requireAuth runs first on every watchlist route, so req.user is always there

// GET /watchlist
export async function getWatchlist(req: Request, res: Response) {
  res.json(await watchlistService.getWatchlist(req.user!.id));
}

// PUT /watchlist/movies/:id and /watchlist/series/:id
export function addHandler(kind: Title["kind"]) {
  return async (req: Request<{ id: string }>, res: Response) => {
    await watchlistService.addToWatchlist(req.user!.id, { kind, id: Number(req.params.id) });
    res.status(204).end();
  };
}

// DELETE /watchlist/movies/:id and /watchlist/series/:id
export function removeHandler(kind: Title["kind"]) {
  return async (req: Request<{ id: string }>, res: Response) => {
    await watchlistService.removeFromWatchlist(req.user!.id, { kind, id: Number(req.params.id) });
    res.status(204).end();
  };
}
