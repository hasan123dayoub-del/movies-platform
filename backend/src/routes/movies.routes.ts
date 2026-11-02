import { Router } from "express";
import {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movies.controller.js";
import {
  addActorToMovie,
  updateActorRole,
  removeActorFromMovie,
} from "../controllers/movieActors.controller.js";
import { validate } from "../middleware/validate.js";
import { idParams, castParams } from "../schemas/common.schema.js";
import { createMovieSchema, updateMovieSchema } from "../schemas/movie.schema.js";
import { addActorSchema, updateRoleSchema } from "../schemas/cast.schema.js";

const router = Router();

router.get("/", getMovies);
router.get("/:id", validate({ params: idParams }), getMovie);
router.post("/", validate({ body: createMovieSchema }), createMovie);
router.put("/:id", validate({ params: idParams, body: updateMovieSchema }), updateMovie);
router.delete("/:id", validate({ params: idParams }), deleteMovie);

// Cast: actors in a movie and their roles
router.post("/:id/actors", validate({ params: idParams, body: addActorSchema }), addActorToMovie);
router.put("/:id/actors/:actorId", validate({ params: castParams, body: updateRoleSchema }), updateActorRole);
router.delete("/:id/actors/:actorId", validate({ params: castParams }), removeActorFromMovie);

export default router;
