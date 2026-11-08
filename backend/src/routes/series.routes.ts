import { Router } from "express";
import {
  getSeriesList,
  getSeries,
  createSeries,
  updateSeries,
  deleteSeries,
  addSeason,
  addActor,
  updateActorRole,
  removeActor,
} from "../controllers/series.controller.js";
import {
  updateSeason,
  deleteSeason,
  addEpisode,
  updateEpisode,
  deleteEpisode,
} from "../controllers/seasons.controller.js";
import { validate } from "../middleware/validate.js";
import { adminOnly } from "../middleware/auth.js";
import { idParams, castParams } from "../schemas/common.schema.js";
import { addActorSchema, updateRoleSchema } from "../schemas/cast.schema.js";
import {
  createSeriesSchema,
  updateSeriesSchema,
  seriesListQuery,
  createSeasonSchema,
  updateSeasonSchema,
  createEpisodeSchema,
  updateEpisodeSchema,
} from "../schemas/series.schema.js";

// Reading is public; changing anything needs an admin (adminOnly)

// /series
export const seriesRouter = Router();
seriesRouter.get("/", validate({ query: seriesListQuery }), getSeriesList);
seriesRouter.get("/:id", validate({ params: idParams }), getSeries);
seriesRouter.post("/", adminOnly, validate({ body: createSeriesSchema }), createSeries);
seriesRouter.put("/:id", adminOnly, validate({ params: idParams, body: updateSeriesSchema }), updateSeries);
seriesRouter.delete("/:id", adminOnly, validate({ params: idParams }), deleteSeries);

// A new season belongs to a series
seriesRouter.post("/:id/seasons", adminOnly, validate({ params: idParams, body: createSeasonSchema }), addSeason);

// Cast: actors in a series and their roles
seriesRouter.post("/:id/actors", adminOnly, validate({ params: idParams, body: addActorSchema }), addActor);
seriesRouter.put("/:id/actors/:actorId", adminOnly, validate({ params: castParams, body: updateRoleSchema }), updateActorRole);
seriesRouter.delete("/:id/actors/:actorId", adminOnly, validate({ params: castParams }), removeActor);

// /seasons
export const seasonsRouter = Router();
seasonsRouter.put("/:id", adminOnly, validate({ params: idParams, body: updateSeasonSchema }), updateSeason);
seasonsRouter.delete("/:id", adminOnly, validate({ params: idParams }), deleteSeason);
seasonsRouter.post("/:id/episodes", adminOnly, validate({ params: idParams, body: createEpisodeSchema }), addEpisode);

// /episodes
export const episodesRouter = Router();
episodesRouter.put("/:id", adminOnly, validate({ params: idParams, body: updateEpisodeSchema }), updateEpisode);
episodesRouter.delete("/:id", adminOnly, validate({ params: idParams }), deleteEpisode);
