import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { findSeriesOrFail } from "./series.service.js";
import type {
  CreateEpisodeInput,
  CreateSeasonInput,
  UpdateEpisodeInput,
  UpdateSeasonInput,
} from "../schemas/series.schema.js";

// ---------- Seasons ----------

export async function findSeasonOrFail(id: number) {
  const season = await prisma.season.findUnique({ where: { id } });
  if (!season) {
    throw new HttpError(404, "Season not found");
  }
  return season;
}

// Two seasons of one series can't share a number (the database refuses it too)
async function assertSeasonNumberFree(seriesId: number, number: number, exceptId?: number) {
  const taken = await prisma.season.findUnique({
    where: { seriesId_number: { seriesId, number } },
    select: { id: true },
  });
  if (taken && taken.id !== exceptId) {
    throw new HttpError(409, `Season ${number} already exists in this series`);
  }
}

export async function addSeason(seriesId: number, data: CreateSeasonInput) {
  await findSeriesOrFail(seriesId);
  await assertSeasonNumberFree(seriesId, data.number);
  return prisma.season.create({ data: { ...data, seriesId } });
}

export async function updateSeason(id: number, data: UpdateSeasonInput) {
  const season = await findSeasonOrFail(id);
  if (data.number !== undefined) {
    await assertSeasonNumberFree(season.seriesId, data.number, id);
  }
  return prisma.season.update({ where: { id }, data });
}

export async function deleteSeason(id: number) {
  await findSeasonOrFail(id);
  // Its episodes go with it (onDelete: Cascade)
  await prisma.season.delete({ where: { id } });
}

// ---------- Episodes ----------

export async function findEpisodeOrFail(id: number) {
  const episode = await prisma.episode.findUnique({ where: { id } });
  if (!episode) {
    throw new HttpError(404, "Episode not found");
  }
  return episode;
}

async function assertEpisodeNumberFree(seasonId: number, number: number, exceptId?: number) {
  const taken = await prisma.episode.findUnique({
    where: { seasonId_number: { seasonId, number } },
    select: { id: true },
  });
  if (taken && taken.id !== exceptId) {
    throw new HttpError(409, `Episode ${number} already exists in this season`);
  }
}

export async function addEpisode(seasonId: number, data: CreateEpisodeInput) {
  await findSeasonOrFail(seasonId);
  await assertEpisodeNumberFree(seasonId, data.number);
  return prisma.episode.create({ data: { ...data, seasonId } });
}

export async function updateEpisode(id: number, data: UpdateEpisodeInput) {
  const episode = await findEpisodeOrFail(id);
  if (data.number !== undefined) {
    await assertEpisodeNumberFree(episode.seasonId, data.number, id);
  }
  return prisma.episode.update({ where: { id }, data });
}

export async function deleteEpisode(id: number) {
  await findEpisodeOrFail(id);
  await prisma.episode.delete({ where: { id } });
}
