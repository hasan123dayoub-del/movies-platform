import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function getActors(req: Request, res: Response) {
  const actors = await prisma.actor.findMany({
    orderBy: { id: "asc" },
  });

  res.json(actors);
}

export async function getActor(req: Request<{ id: string }>, res: Response) {
  const actor = await prisma.actor.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      movies: {
        include: { movie: true },
      },
    },
  });
  if (!actor) {
    res.status(404).json({ message: "Actor not found" });
    return;
  }

  res.json(actor);
}

export async function createActor(req: Request, res: Response) {
  const { name, birthday, nationality } = req.body;

  const actor = await prisma.actor.create({
    data: { name, birthday: new Date(birthday), nationality },
  });

  res.status(201).json(actor);
}

export async function updateActor(req: Request<{ id: string }>, res: Response) {
  const id = Number(req.params.id);

  const exists = await prisma.actor.findUnique({
    where: { id },
  });
  if (!exists) {
    res.status(404).json({ message: "Actor not found" });
    return;
  }

  const { name, birthday, nationality } = req.body;
  const actor = await prisma.actor.update({
    where: { id },
    data: {
      name,
      nationality,
      ...(birthday && { birthday: new Date(birthday) }),
    },
  });

  res.json(actor);
}

export async function deleteActor(req: Request<{ id: string }>, res: Response) {
  const id = Number(req.params.id);
  const exists = await prisma.actor.findUnique({
    where: { id },
  });
  if (!exists) {
    res.status(404).json({ message: "Actor not found" });
    return;
  }
  await prisma.actor.delete({ where: { id } });
  res.status(204).send();
}
