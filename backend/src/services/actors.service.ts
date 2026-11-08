import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { rankByMatch } from "../lib/search.js";
import type {
  ActorListQuery,
  CreateActorInput,
  UpdateActorInput,
} from "../schemas/actor.schema.js";

// Like Actor::findOrFail($id)
export async function findActorOrFail(id: number) {
  const actor = await prisma.actor.findUnique({ where: { id } });
  if (!actor) {
    throw new HttpError(404, "Actor not found");
  }
  return actor;
}

// A to Z. GET /actors?search=leo keeps only names containing "leo", any case
export async function listActors({ search }: ActorListQuery) {
  const actors = await prisma.actor.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : {},
    orderBy: { name: "asc" },
  });
  // While searching, names that start with the text come first ("le" -> Leonardo before Ralph)
  return search ? rankByMatch(actors, search, (actor) => actor.name) : actors;
}

// The actor with their movies and series (and the role in each), best rated first
export async function getActorWithMovies(id: number) {
  const actor = await prisma.actor.findUnique({
    where: { id },
    include: {
      movies: { include: { movie: true }, orderBy: { movie: { rating: "desc" } } },
      series: { include: { series: true }, orderBy: { series: { rating: "desc" } } },
    },
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
