import { Router } from "express";
import { register, login, me, updateMe, changePassword, myReviews } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { limitFailures, byEmail } from "../middleware/rate-limit.js";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../schemas/auth.schema.js";
import { reviewListQuery } from "../schemas/review.schema.js";

const router = Router();

// After 10 wrong passwords for one email, that email waits 15 minutes
const loginLimit = limitFailures({ max: 10, minutes: 15, key: byEmail });

// The same for changing the password: 10 wrong "current password" tries per account
// (someone at an unlocked computer can't guess it forever)
const passwordLimit = limitFailures({ max: 10, minutes: 15, key: (req) => (req.user ? `password:${req.user.id}` : null) });

router.post("/register", validate({ body: registerSchema }), register);
router.post("/login", loginLimit, validate({ body: loginSchema }), login);

// The logged-in member's own account
router.get("/me", requireAuth, me);
router.put("/me", requireAuth, validate({ body: updateProfileSchema }), updateMe);
router.put("/me/password", requireAuth, passwordLimit, validate({ body: changePasswordSchema }), changePassword);
router.get("/me/reviews", requireAuth, validate({ query: reviewListQuery }), myReviews);

// Logging out happens in the frontend: it deletes its cookie with the token.
// A JWT can't be "turned off" on the server; it simply expires after 7 days.

export default router;
