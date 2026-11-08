import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { findSeriesOrFail } from "./series.service.js";
import { findActorOrFail } from "./actors.service.js";
import type { AddActorInput, UpdateRoleInput } from "../schemas/cast.schema.js";

// The same rules as a movie's cast (cast.service.ts), for a series

async function findCastMemberOrFail(seriesId: number, actorId: number) {
  const castMember = await prisma.seriesActor.findUnique({
    where: { seriesId_actorId: { seriesId, actorId } },
  });
  if (!castMember) {
    throw new HttpError(404, "Actor is not in this series");
  }
  return castMember;
}

export async function addActorToSeries(seriesId: number, { actorId, role }: AddActorInput) {
  await findSeriesOrFail(seriesId);
  await findActorOrFail(actorId);

  const alreadyInCast = await prisma.seriesActor.findUnique({
    where: { seriesId_actorId: { seriesId, actorId } },
  });
  if (alreadyInCast) {
    throw new HttpError(409, "Actor is already in this series");
  }

  return prisma.seriesActor.create({
    data: { seriesId, actorId, role },
    include: { actor: true },
  });
}

export async function updateActorRole(seriesId: number, actorId: number, { role }: UpdateRoleInput) {
  await findCastMemberOrFail(seriesId, actorId);
  return prisma.seriesActor.update({
    where: { seriesId_actorId: { seriesId, actorId } },
    data: { role },
    include: { actor: true },
  });
}

export async function removeActorFromSeries(seriesId: number, actorId: number) {
  await findCastMemberOrFail(seriesId, actorId);
  await prisma.seriesActor.delete({
    where: { seriesId_actorId: { seriesId, actorId } },
  });
}
