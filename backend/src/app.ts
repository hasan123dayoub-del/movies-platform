// The Express app: middleware and routes. server.ts starts it; the tests use it directly.
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { buildOpenApi } from "./docs/openapi.js";
import authRouter from "./routes/auth.routes.js";
import moviesRouter from "./routes/movies.routes.js";
import actorsRouter from "./routes/actors.routes.js";
import { seriesRouter, seasonsRouter, episodesRouter } from "./routes/series.routes.js";
import { reviewRoutes, reviewsRouter, watchlistRouter } from "./routes/reviews.routes.js";
import adminRouter from "./routes/admin.routes.js";
import { notFound, errorHandler } from "./middleware/errors.js";
import { prisma } from "./lib/prisma.js";

const app = express();

// Safe default security headers (and no "X-Powered-By: Express")
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

// The front door: where to go next
app.get("/", (req, res) => {
  res.json({
    message: "Movies Platform API is running",
    docs: "/docs",
    openapi: "/openapi.json",
    health: "/health",
    demoAccounts: [
      { role: "ADMIN", email: "admin@movies.dev", password: "admin1234" },
      { role: "USER", email: "user@movies.dev", password: "user1234" },
    ],
    website: "https://movies-platform-web.onrender.com",
  });
});

// Interactive docs (Swagger UI) at /docs, from the OpenAPI document built from the Zod schemas
const openApi = buildOpenApi();
app.get("/openapi.json", (req, res) => {
  res.json(openApi);
});
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApi, {
    customSiteTitle: "Movies Platform API",
    // The token pasted in "Authorize" survives a page reload
    swaggerOptions: { persistAuthorization: true, tryItOutEnabled: true },
  }),
);

// For uptime checks and the deploy platform: is the API up, and can it reach the database?
app.get("/health", async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/movies", moviesRouter);
app.use("/actors", actorsRouter);
app.use("/series", seriesRouter);
app.use("/seasons", seasonsRouter);
app.use("/episodes", episodesRouter);
// Members: reviews on every movie and series, and their own watchlist
app.use("/movies", reviewRoutes("movie"));
app.use("/series", reviewRoutes("series"));
app.use("/reviews", reviewsRouter);
app.use("/watchlist", watchlistRouter);
app.use("/admin", adminRouter);

// These two must stay last: they handle whatever the routes above did not
app.use(notFound);
app.use(errorHandler);

export default app;
