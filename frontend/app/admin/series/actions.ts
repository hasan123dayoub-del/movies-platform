"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSeries,
  updateSeries,
  deleteSeries,
  addSeason,
  updateSeason,
  deleteSeason,
  addEpisode,
  updateEpisode,
  deleteEpisode,
  addActorToSeries,
  updateSeriesRole,
  removeActorFromSeries,
} from "@/lib/api";
import { CATALOG_TAG } from "@/lib/api/cache";
import { requireAdmin } from "@/lib/auth";
import { readText, emptyToNull, emptyFormState } from "@/lib/form";
import type {
  CastInput,
  EpisodeInput,
  FormState,
  SeasonInput,
  SeriesInput,
} from "@/lib/types";

// Same rules as the movie actions: every action checks for an admin first
// (anyone can call a Server Action), and updateTag() refreshes the cached pages after.

// "" -> undefined (so the API says "required"), "2010" -> 2010
const toNumber = (text: string) => (text === "" ? undefined : Number(text));
// "" -> null (an optional number left empty), "2010" -> 2010
const toNumberOrNull = (text: string) => (text === "" ? null : Number(text));

// ---------- Series ----------

function readSeriesForm(formData: FormData) {
  const values = {
    title: readText(formData, "title"),
    type: readText(formData, "type"),
    rating: readText(formData, "rating"),
    creator: readText(formData, "creator"),
    startYear: readText(formData, "startYear"),
    endYear: readText(formData, "endYear"),
    description: readText(formData, "description"),
    posterUrl: readText(formData, "posterUrl"),
  };
  const data = {
    title: values.title,
    type: values.type,
    rating: toNumber(values.rating),
    creator: values.creator,
    startYear: toNumber(values.startYear),
    // Left empty = the series is still running
    endYear: toNumberOrNull(values.endYear),
    description: emptyToNull(values.description),
    posterUrl: emptyToNull(values.posterUrl),
  } as SeriesInput;
  return { values, data };
}

export async function createSeriesAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { values, data } = readSeriesForm(formData);
  const result = await createSeries(data);
  if (!result.ok) return { errors: result.errors, values };

  updateTag(CATALOG_TAG);
  // Seasons and cast need the series' id: continue on its edit page
  redirect(`/admin/series/${result.data.id}/edit#seasons`);
}

export async function updateSeriesAction(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { values, data } = readSeriesForm(formData);
  const result = await updateSeries(id, data);
  if (!result.ok) return { errors: result.errors, values };

  updateTag(CATALOG_TAG);
  redirect("/admin/series");
}

export async function deleteSeriesAction(id: number) {
  await requireAdmin();
  await deleteSeries(id);
  updateTag(CATALOG_TAG);
}

// ---------- Seasons ----------

function readSeasonForm(formData: FormData) {
  const values = {
    number: readText(formData, "number"),
    title: readText(formData, "title"),
    releaseYear: readText(formData, "releaseYear"),
    description: readText(formData, "description"),
    posterUrl: readText(formData, "posterUrl"),
  };
  const data = {
    number: toNumber(values.number),
    title: emptyToNull(values.title),
    releaseYear: toNumberOrNull(values.releaseYear),
    description: emptyToNull(values.description),
    posterUrl: emptyToNull(values.posterUrl),
  } as SeasonInput;
  return { values, data };
}

export async function addSeasonAction(seriesId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { values, data } = readSeasonForm(formData);
  const result = await addSeason(seriesId, data);
  if (!result.ok) return { errors: result.errors, values };

  updateTag(CATALOG_TAG);
  return emptyFormState;
}

// After saving, back to the series it belongs to
export async function updateSeasonAction(
  seasonId: number,
  seriesId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { values, data } = readSeasonForm(formData);
  const result = await updateSeason(seasonId, data);
  if (!result.ok) return { errors: result.errors, values };

  updateTag(CATALOG_TAG);
  redirect(`/admin/series/${seriesId}/edit#seasons`);
}

export async function deleteSeasonAction(seasonId: number) {
  await requireAdmin();
  await deleteSeason(seasonId);
  updateTag(CATALOG_TAG);
}

// ---------- Episodes ----------

function readEpisodeForm(formData: FormData) {
  const values = {
    number: readText(formData, "number"),
    title: readText(formData, "title"),
    airDate: readText(formData, "airDate"),
    runtime: readText(formData, "runtime"),
    description: readText(formData, "description"),
  };
  const data = {
    number: toNumber(values.number),
    title: values.title,
    // <input type="date"> gives "YYYY-MM-DD" (the API turns it into a date); empty = unknown
    airDate: emptyToNull(values.airDate),
    runtime: toNumberOrNull(values.runtime),
    description: emptyToNull(values.description),
  } as EpisodeInput;
  return { values, data };
}

export async function addEpisodeAction(seasonId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { values, data } = readEpisodeForm(formData);
  const result = await addEpisode(seasonId, data);
  if (!result.ok) return { errors: result.errors, values };

  updateTag(CATALOG_TAG);
  return emptyFormState;
}

export async function updateEpisodeAction(episodeId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { values, data } = readEpisodeForm(formData);
  const result = await updateEpisode(episodeId, data);
  if (!result.ok) return { errors: result.errors, values };

  updateTag(CATALOG_TAG);
  // "saved" tells the row to close its edit form
  return { errors: {}, values: { saved: "1" } };
}

export async function deleteEpisodeAction(episodeId: number) {
  await requireAdmin();
  await deleteEpisode(episodeId);
  updateTag(CATALOG_TAG);
}

// ---------- Cast (same shape as the movie cast actions, so CastEditor can use both) ----------

export async function addSeriesCastAction(seriesId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = { actorId: readText(formData, "actorId"), role: readText(formData, "role") };
  const result = await addActorToSeries(seriesId, {
    actorId: toNumber(values.actorId),
    role: values.role,
  } as CastInput);
  if (!result.ok) return { errors: result.errors, values };

  updateTag(CATALOG_TAG);
  return emptyFormState;
}

export async function updateSeriesRoleAction(
  seriesId: number,
  actorId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = { role: readText(formData, "role") };
  const result = await updateSeriesRole(seriesId, actorId, values.role);
  if (!result.ok) return { errors: result.errors, values };

  updateTag(CATALOG_TAG);
  return emptyFormState;
}

export async function removeSeriesCastAction(seriesId: number, actorId: number) {
  await requireAdmin();
  await removeActorFromSeries(seriesId, actorId);
  updateTag(CATALOG_TAG);
}

