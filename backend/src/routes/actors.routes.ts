import { Router } from "express";
import {
  getActors,
  getActor,
  createActor,
  updateActor,
  deleteActor,
} from "../controllers/actors.controller.js";
import { validate } from "../middleware/validate.js";
import { adminOnly } from "../middleware/auth.js";
import { idParams } from "../schemas/common.schema.js";
import { createActorSchema, updateActorSchema, actorListQuery } from "../schemas/actor.schema.js";

const router = Router();

// Reading is public; changing anything needs an admin (adminOnly)
router.get("/", validate({ query: actorListQuery }), getActors);
router.get("/:id", validate({ params: idParams }), getActor);
router.post("/", adminOnly, validate({ body: createActorSchema }), createActor);
router.put("/:id", adminOnly, validate({ params: idParams, body: updateActorSchema }), updateActor);
router.delete("/:id", adminOnly, validate({ params: idParams }), deleteActor);

export default router;
