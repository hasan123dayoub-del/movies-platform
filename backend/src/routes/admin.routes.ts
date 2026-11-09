import { Router } from "express";
import { adminOnly } from "../middleware/auth.js";
import { stats } from "../controllers/admin.controller.js";

// /admin: data only admins can read
const router = Router();

router.get("/stats", adminOnly, stats);

export default router;
