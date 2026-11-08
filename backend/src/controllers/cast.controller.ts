import type { Request, Response } from "express";
import * as castService from "../services/cast.service.js";

type CastParams = { id: string; actorId: string };

// POST /movies/:id/actors
export async function addActorToMovie(req: Request<{ id: string }>, res: Response) {
  const castMember = await castService.addActorToMovie(Number(req.params.id), req.body);
  res.status(201).json(castMember);
}

// PUT /movies/:id/actors/:actorId
export async function updateActorRole(req: Request<CastParams>, res: Response) {
  const updated = await castService.updateActorRole(
    Number(req.params.id),
    Number(req.params.actorId),
    req.body,
  );
  res.json(updated);
}

// DELETE /movies/:id/actors/:actorId
export async function removeActorFromMovie(req: Request<CastParams>, res: Response) {
  await castService.removeActorFromMovie(Number(req.params.id), Number(req.params.actorId));
  res.status(204).send();
}
