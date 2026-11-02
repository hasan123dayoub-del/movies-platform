import { Router } from "express";
import {
  getActors,
  getActor,
  createActor,
  updateActor,
  deleteActor,
} from "../controllers/actors.controller.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../schemas/common.schema.js";
import { createActorSchema, updateActorSchema } from "../schemas/actor.schema.js";

const router = Router();

router.get("/", getActors);
router.get("/:id", validate({ params: idParams }), getActor);
router.post("/", validate({ body: createActorSchema }), createActor);
router.put("/:id", validate({ params: idParams, body: updateActorSchema }), updateActor);
router.delete("/:id", validate({ params: idParams }), deleteActor);

export default router;
