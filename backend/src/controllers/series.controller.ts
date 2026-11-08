import type { Request, Response } from "express";
import * as seriesService from "../services/series.service.js";
import * as castService from "../services/series-cast.service.js";
import * as seasonsService from "../services/seasons.service.js";
import type { SeriesListQuery } from "../schemas/series.schema.js";

type CastParams = { id: string; actorId: string };

// GET /series?search=&type=&sort= (validate() put the clean query in res.locals)
export async function getSeriesList(req: Request, res: Response<unknown, { query: SeriesListQuery }>) {
  res.json(await seriesService.listSeries(res.locals.query));
}

// GET /series/:id -> with its seasons, episodes and cast
export async function getSeries(req: Request<{ id: string }>, res: Response) {
  res.json(await seriesService.getSeriesWithDetails(Number(req.params.id)));
}

// POST /series
export async function createSeries(req: Request, res: Response) {
  res.status(201).json(await seriesService.createSeries(req.body));
}

// PUT /series/:id
export async function updateSeries(req: Request<{ id: string }>, res: Response) {
  res.json(await seriesService.updateSeries(Number(req.params.id), req.body));
}

// DELETE /series/:id
export async function deleteSeries(req: Request<{ id: string }>, res: Response) {
  await seriesService.deleteSeries(Number(req.params.id));
  res.status(204).send();
}

// POST /series/:id/seasons
export async function addSeason(req: Request<{ id: string }>, res: Response) {
  res.status(201).json(await seasonsService.addSeason(Number(req.params.id), req.body));
}

// POST /series/:id/actors
export async function addActor(req: Request<{ id: string }>, res: Response) {
  res.status(201).json(await castService.addActorToSeries(Number(req.params.id), req.body));
}

// PUT /series/:id/actors/:actorId
export async function updateActorRole(req: Request<CastParams>, res: Response) {
  res.json(
    await castService.updateActorRole(Number(req.params.id), Number(req.params.actorId), req.body),
  );
}

// DELETE /series/:id/actors/:actorId
export async function removeActor(req: Request<CastParams>, res: Response) {
  await castService.removeActorFromSeries(Number(req.params.id), Number(req.params.actorId));
  res.status(204).send();
}
