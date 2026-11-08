import type { Request, Response } from "express";
import * as seasonsService from "../services/seasons.service.js";

// Seasons and episodes have their own ids, so once created they are reached directly:
// /seasons/:id and /episodes/:id (shorter than /series/1/seasons/2/episodes/3)

// PUT /seasons/:id
export async function updateSeason(req: Request<{ id: string }>, res: Response) {
  res.json(await seasonsService.updateSeason(Number(req.params.id), req.body));
}

// DELETE /seasons/:id (its episodes go with it)
export async function deleteSeason(req: Request<{ id: string }>, res: Response) {
  await seasonsService.deleteSeason(Number(req.params.id));
  res.status(204).send();
}

// POST /seasons/:id/episodes
export async function addEpisode(req: Request<{ id: string }>, res: Response) {
  res.status(201).json(await seasonsService.addEpisode(Number(req.params.id), req.body));
}

// PUT /episodes/:id
export async function updateEpisode(req: Request<{ id: string }>, res: Response) {
  res.json(await seasonsService.updateEpisode(Number(req.params.id), req.body));
}

// DELETE /episodes/:id
export async function deleteEpisode(req: Request<{ id: string }>, res: Response) {
  await seasonsService.deleteEpisode(Number(req.params.id));
  res.status(204).send();
}
