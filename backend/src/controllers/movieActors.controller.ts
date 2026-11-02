import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

type CastParams = { id: string; actorId: string };

// POST /movies/:id/actors
export async function addActorToMovie(
  req: Request<{ id: string }>,
  res: Response,
) {
  const movieId = Number(req.params.id);
  const { actorId, role } = req.body;

  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) {
    res.status(404).json({ message: "Movie not found" });
    return;
  }

  const actor = await prisma.actor.findUnique({ where: { id: actorId } });
  if (!actor) {
    res.status(404).json({ message: "Actor not found" });
    return;
  }

  const alreadyInCast = await prisma.movieActor.findUnique({
    where: { movieId_actorId: { movieId, actorId } },
  });
  if (alreadyInCast) {
    res.status(409).json({ message: "Actor is already in this movie" });
    return;
  }

  const castMember = await prisma.movieActor.create({
    data: { movieId, actorId, role },
    include: { actor: true },
  });

  res.status(201).json(castMember);
}

// PUT /movies/:id/actors/:actorId
export async function updateActorRole(req: Request<CastParams>, res: Response) {
  const movieId = Number(req.params.id);
  const actorId = Number(req.params.actorId);

  const castMember = await prisma.movieActor.findUnique({
    where: { movieId_actorId: { movieId, actorId } },
  });
  if (!castMember) {
    res.status(404).json({ message: "Actor is not in this movie" });
    return;
  }

  const updated = await prisma.movieActor.update({
    where: { movieId_actorId: { movieId, actorId } },
    data: { role: req.body.role },
    include: { actor: true },
  });

  res.json(updated);
}

// DELETE /movies/:id/actors/:actorId
export async function removeActorFromMovie(req: Request<CastParams>, res: Response) {
  const movieId = Number(req.params.id);
  const actorId = Number(req.params.actorId);

  const castMember = await prisma.movieActor.findUnique({
    where: { movieId_actorId: { movieId, actorId } },
  });
  if (!castMember) {
    res.status(404).json({ message: "Actor is not in this movie" });
    return;
  }

  await prisma.movieActor.delete({
    where: { movieId_actorId: { movieId, actorId } },
  });

  res.status(204).send();
}
