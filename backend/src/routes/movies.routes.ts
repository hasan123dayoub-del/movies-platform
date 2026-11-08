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
} from "../controllers/cast.controller.js";
import { validate } from "../middleware/validate.js";
import { adminOnly } from "../middleware/auth.js";
import { idParams, castParams } from "../schemas/common.schema.js";
import { createMovieSchema, updateMovieSchema, movieListQuery } from "../schemas/movie.schema.js";
import { addActorSchema, updateRoleSchema } from "../schemas/cast.schema.js";

const router = Router();

// Reading is public; changing anything needs an admin (adminOnly)
router.get("/", validate({ query: movieListQuery }), getMovies);
router.get("/:id", validate({ params: idParams }), getMovie);
router.post("/", adminOnly, validate({ body: createMovieSchema }), createMovie);
router.put("/:id", adminOnly, validate({ params: idParams, body: updateMovieSchema }), updateMovie);
router.delete("/:id", adminOnly, validate({ params: idParams }), deleteMovie);

// Cast: actors in a movie and their roles
router.post("/:id/actors", adminOnly, validate({ params: idParams, body: addActorSchema }), addActorToMovie);
router.put("/:id/actors/:actorId", adminOnly, validate({ params: castParams, body: updateRoleSchema }), updateActorRole);
router.delete("/:id/actors/:actorId", adminOnly, validate({ params: castParams }), removeActorFromMovie);

export default router;
