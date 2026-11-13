import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { listOrPage } from "../lib/paginate.js";
import type {
  ActorListQuery,
  CreateActorInput,
  UpdateActorInput,
} from "../schemas/actor.schema.js";
import { deathAfterBirth, DEATH_BEFORE_BIRTH } from "../schemas/actor.schema.js";

// Like Actor::findOrFail($id)
export async function findActorOrFail(id: number) {
  const actor = await prisma.actor.findUnique({ where: { id } });
  if (!actor) {
    throw new HttpError(404, "Actor not found");
  }
  return actor;
}

// A to Z. GET /actors?search=leo keeps only names containing "leo", any case
export async function listActors(query: ActorListQuery) {
  const { search } = query;
  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
  // The full list, or one page of it with ?page. While searching, names that start
  // with the text come first ("le" -> Leonardo before Ralph)
  return listOrPage({
    query,
    find: (range) => prisma.actor.findMany({ where, orderBy: { name: "asc" }, ...range }),
    count: () => prisma.actor.count({ where }),
    textOf: (actor) => actor.name,
    decorate: async (actors) => actors,
  });
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
  const saved = await findActorOrFail(id);
  // One of the two dates may be new and the other the saved one
  const birthday = data.birthday ?? saved.birthday;
  const deathDate = data.deathDate === undefined ? saved.deathDate : data.deathDate;
  if (!deathAfterBirth(birthday, deathDate)) {
    throw new HttpError(400, "Validation failed", [{ field: "deathDate", message: DEATH_BEFORE_BIRTH }]);
  }
  return prisma.actor.update({ where: { id }, data });
}

export async function deleteActor(id: number) {
  await findActorOrFail(id);
  await prisma.actor.delete({ where: { id } });
}
