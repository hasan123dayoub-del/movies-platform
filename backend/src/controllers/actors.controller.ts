import type { Request, Response } from "express";
import * as actorsService from "../services/actors.service.js";
import type { ActorListQuery } from "../schemas/actor.schema.js";

// GET /actors?search= (validate() put the clean query in res.locals)
export async function getActors(req: Request, res: Response<unknown, { query: ActorListQuery }>) {
  res.json(await actorsService.listActors(res.locals.query));
}

// GET /actors/:id
export async function getActor(req: Request<{ id: string }>, res: Response) {
  res.json(await actorsService.getActorWithMovies(Number(req.params.id)));
}

// POST /actors
export async function createActor(req: Request, res: Response) {
  const actor = await actorsService.createActor(req.body);
  res.status(201).json(actor);
}

// PUT /actors/:id
export async function updateActor(req: Request<{ id: string }>, res: Response) {
  res.json(await actorsService.updateActor(Number(req.params.id), req.body));
}

// DELETE /actors/:id
export async function deleteActor(req: Request<{ id: string }>, res: Response) {
  await actorsService.deleteActor(Number(req.params.id));
  res.status(204).send();
}
