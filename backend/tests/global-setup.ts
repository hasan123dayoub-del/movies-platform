import { execSync } from "node:child_process";

// Runs once before all tests: bring the test database up to date and fill it with the
// sample data (only if it's empty), the same way the server does on Render.
export default function setup() {
  const env = {
    ...process.env,
    DATABASE_URL:
      process.env.TEST_DATABASE_URL ?? "postgresql://movies:movies@localhost:5433/movies_test",
    SEED_ONLY_IF_EMPTY: "1",
  };
  execSync("npx prisma migrate deploy", { env, stdio: "inherit" });
  execSync("npx prisma db seed", { env, stdio: "inherit" });
}
