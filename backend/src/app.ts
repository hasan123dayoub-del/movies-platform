// The Express app: middleware and routes. server.ts starts it; the tests use it directly.
import express from "express";
import helmet from "helmet";
import authRouter from "./routes/auth.routes.js";
import moviesRouter from "./routes/movies.routes.js";
import actorsRouter from "./routes/actors.routes.js";
import { seriesRouter, seasonsRouter, episodesRouter } from "./routes/series.routes.js";
import { reviewRoutes, reviewsRouter, watchlistRouter } from "./routes/reviews.routes.js";
import { notFound, errorHandler } from "./middleware/errors.js";
import { prisma } from "./lib/prisma.js";

const app = express();

// Safe default security headers (and no "X-Powered-By: Express")
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
  res.json({ message: "Movies API is running" });
});

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

// These two must stay last: they handle whatever the routes above did not
app.use(notFound);
app.use(errorHandler);

export default app;
