import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../lib/http-error.js";

type Options = {
  // How many failed tries are allowed...
  max: number;
  // ...within this many minutes
  minutes: number;
  // What one "person" is, or null to not limit this request at all.
  // The Next.js server makes every call for its visitors, so the IP is the same for
  // everyone: the login form keys on the email instead.
  key: (req: Request) => string | null;
};

// Slows down password guessing (like Laravel's throttle middleware on login).
// Only FAILED attempts count (a 4xx answer), so a user who logs in correctly is never
// blocked. Kept in memory: fine for one server; several servers would share it in Redis.
export function limitFailures({ max, minutes, key }: Options) {
  const windowMs = minutes * 60 * 1000;
  const failures = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const id = key(req);
    if (id === null) {
      next();
      return;
    }

    const now = Date.now();
    const entry = failures.get(id);
    if (entry && entry.resetAt > now && entry.count >= max) {
      const seconds = Math.ceil((entry.resetAt - now) / 1000);
      const minutesLeft = Math.ceil(seconds / 60);
      res.set("Retry-After", String(seconds));
      throw new HttpError(
        429,
        `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
      );
    }

    // Count it once the answer is known
    res.on("finish", () => {
      if (res.statusCode < 400 || res.statusCode >= 500) return;
      const current = failures.get(id);
      if (!current || current.resetAt <= Date.now()) {
        failures.set(id, { count: 1, resetAt: Date.now() + windowMs });
      } else {
        current.count++;
      }
      // Forget expired entries now and then, so the map can't grow forever
      if (failures.size > 10_000) {
        for (const [k, v] of failures) if (v.resetAt <= Date.now()) failures.delete(k);
      }
    });

    next();
  };
}

// The email from the body, lowercased, so "Sam@x.com" and "sam@x.com" share a counter.
// No email: not limited (validation rejects the request anyway).
export function byEmail(req: Request) {
  const email: unknown = req.body?.email;
  return typeof email === "string" && email.trim() !== "" ? email.trim().toLowerCase() : null;
}
