import "dotenv/config";
import { z } from "zod";

// Every setting the API needs, checked once at startup (like config/*.php reading .env in Laravel).
// A missing or bad value stops the server right away with a clear message,
// instead of failing later in the middle of a request.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.url({ error: "DATABASE_URL must be a postgresql:// connection URL" }),
  JWT_SECRET: z
    .string({ error: "JWT_SECRET is missing" })
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  // TMDB's "API Read Access Token", for "where to watch". Optional: without it the
  // rest of the API works and that one endpoint answers 503.
  TMDB_TOKEN: z
    .string()
    .optional()
    .transform((token) => token?.trim() || undefined),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables in backend/.env:");
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = result.data;
