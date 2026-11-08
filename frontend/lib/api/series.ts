import { cacheLife, cacheTag } from "next/cache";
import type {
  CastInput,
  CastMember,
  Episode,
  EpisodeInput,
  Season,
  SeasonInput,
  Series,
  SeriesFilters,
  SeriesInput,
  SeriesListItem,
  SeriesWithDetails,
} from "../types";
import { getJson, getJsonOrNull, sendJson, sendDelete } from "./client";
import { CATALOG_TAG } from "./cache";
import { toQuery } from "./query";

// ---------- Reads (cached like movies; any admin change refreshes them) ----------

export async function getSeriesList(filters: SeriesFilters = {}) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("minutes");
  return getJson<SeriesListItem[]>(`/series${toQuery(filters)}`, "Failed to load series");
}

// Every genre already used by a series, A to Z
export async function getSeriesGenres() {
  const list = await getSeriesList();
  return [...new Set(list.map((series) => series.type))].sort();
}

export async function getSeries(id: number) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("minutes");
  return getJsonOrNull<SeriesWithDetails>(`/series/${id}`, "Failed to load series");
}

// ---------- Series ----------

export function createSeries(data: SeriesInput) {
  return sendJson<Series>("POST", "/series", data, "Failed to create series");
}

export function updateSeries(id: number, data: Partial<SeriesInput>) {
  return sendJson<Series>("PUT", `/series/${id}`, data, "Failed to update series");
}

export function deleteSeries(id: number) {
  return sendDelete(`/series/${id}`, "Failed to delete series");
}

// ---------- Seasons ----------

export function addSeason(seriesId: number, data: SeasonInput) {
  return sendJson<Season>("POST", `/series/${seriesId}/seasons`, data, "Failed to add the season");
}

export function updateSeason(id: number, data: Partial<SeasonInput>) {
  return sendJson<Season>("PUT", `/seasons/${id}`, data, "Failed to update the season");
}

export function deleteSeason(id: number) {
  return sendDelete(`/seasons/${id}`, "Failed to delete the season");
}

// ---------- Episodes ----------

export function addEpisode(seasonId: number, data: EpisodeInput) {
  return sendJson<Episode>("POST", `/seasons/${seasonId}/episodes`, data, "Failed to add the episode");
}

export function updateEpisode(id: number, data: Partial<EpisodeInput>) {
  return sendJson<Episode>("PUT", `/episodes/${id}`, data, "Failed to update the episode");
}

export function deleteEpisode(id: number) {
  return sendDelete(`/episodes/${id}`, "Failed to delete the episode");
}

// ---------- Cast ----------

export function addActorToSeries(seriesId: number, data: CastInput) {
  return sendJson<CastMember>("POST", `/series/${seriesId}/actors`, data, "Failed to add the actor to the series");
}

export function updateSeriesRole(seriesId: number, actorId: number, role: string) {
  return sendJson<CastMember>("PUT", `/series/${seriesId}/actors/${actorId}`, { role }, "Failed to update the role");
}

export function removeActorFromSeries(seriesId: number, actorId: number) {
  return sendDelete(`/series/${seriesId}/actors/${actorId}`, "Failed to remove the actor from the series");
}
