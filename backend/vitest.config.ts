import { defineConfig } from "vitest/config";

// `npm test`: runs tests/*.test.ts against a SEPARATE test database, never the dev one.
// Locally that is "movies_test" in the same Docker container; in CI, the workflow's own
// PostgreSQL. Variables already set (like in CI) win over these defaults.
export default defineConfig({
  test: {
    globalSetup: "./tests/global-setup.ts",
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ?? "postgresql://movies:movies@localhost:5433/movies_test",
      JWT_SECRET: process.env.JWT_SECRET ?? "test-only-secret-that-is-long-enough-123",
      NODE_ENV: "test",
    },
    // The test files share one database, so run them one after another
    fileParallelism: false,
    testTimeout: 20000,
  },
});
