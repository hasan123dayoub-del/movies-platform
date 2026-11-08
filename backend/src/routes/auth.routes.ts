import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { limitFailures, byEmail } from "../middleware/rate-limit.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";

const router = Router();

// After 10 wrong passwords for one email, that email waits 15 minutes
const loginLimit = limitFailures({ max: 10, minutes: 15, key: byEmail });

router.post("/register", validate({ body: registerSchema }), register);
router.post("/login", loginLimit, validate({ body: loginSchema }), login);
router.get("/me", requireAuth, me);

// Logging out happens in the frontend: it deletes its cookie with the token.
// A JWT can't be "turned off" on the server; it simply expires after 7 days.

export default router;
