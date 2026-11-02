import { Router } from "express";
import {
  getActors,
  getActor,
  createActor,
  updateActor,
  deleteActor,
} from "../controllers/actors.controller.js";

const router = Router();

router.get("/", getActors);
router.get("/:id", getActor);
router.post("/", createActor);
router.put("/:id", updateActor);
router.delete("/:id", deleteActor);

export default router;
