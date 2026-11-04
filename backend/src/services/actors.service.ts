import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import type { CreateActorInput, UpdateActorInput } from "../schemas/actor.schema.js";

// Like Actor::findOrFail($id)
export async function findActorOrFail(id: number) {
  const actor = await prisma.actor.findUnique({ where: { id } });
  if (!actor) {
    throw new HttpError(404, "Actor not found");
  }
  return actor;
}

export function listActors() {
  return prisma.actor.findMany({ orderBy: { id: "asc" } });
}

// The actor with their movies (each movie and their role in it)
export async function getActorWithMovies(id: number) {
  const actor = await prisma.actor.findUnique({
    where: { id },
    include: { movies: { include: { movie: true } } },
  });
  if (!actor) {
    throw new HttpError(404, "Actor not found");
  }
  return actor;
}

// birthday is already a Date here: the Zod schema converted it
export function createActor(data: CreateActorInput) {
  return prisma.actor.create({ data });
}

export async function updateActor(id: number, data: UpdateActorInput) {
  await findActorOrFail(id);
  return prisma.actor.update({ where: { id }, data });
}

export async function deleteActor(id: number) {
  await findActorOrFail(id);
  await prisma.actor.delete({ where: { id } });
}
