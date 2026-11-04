import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { findMovieOrFail } from "./movies.service.js";
import { findActorOrFail } from "./actors.service.js";
import type { AddActorInput, UpdateRoleInput } from "../schemas/cast.schema.js";

async function findCastMemberOrFail(movieId: number, actorId: number) {
  const castMember = await prisma.movieActor.findUnique({
    where: { movieId_actorId: { movieId, actorId } },
  });
  if (!castMember) {
    throw new HttpError(404, "Actor is not in this movie");
  }
  return castMember;
}

export async function addActorToMovie(movieId: number, { actorId, role }: AddActorInput) {
  await findMovieOrFail(movieId);
  await findActorOrFail(actorId);

  const alreadyInCast = await prisma.movieActor.findUnique({
    where: { movieId_actorId: { movieId, actorId } },
  });
  if (alreadyInCast) {
    throw new HttpError(409, "Actor is already in this movie");
  }

  return prisma.movieActor.create({
    data: { movieId, actorId, role },
    include: { actor: true },
  });
}

export async function updateActorRole(movieId: number, actorId: number, {role}: UpdateRoleInput) {
  await findCastMemberOrFail(movieId, actorId);
  return prisma.movieActor.update({
    where: { movieId_actorId: { movieId, actorId } },
    data: { role },
    include: { actor: true },
  });
}

export async function removeActorFromMovie(movieId: number, actorId: number) {
  await findCastMemberOrFail(movieId, actorId);
  await prisma.movieActor.delete({
    where: { movieId_actorId: { movieId, actorId } },
  });
}

