import express from "express";
import moviesRouter from "./routes/movies.routes.js";
import actorsRouter from "./routes/actors.routes.js";
import { notFound, errorHandler } from "./middleware/errors.js";

const app = express();
const PORT = 4000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Movies API is running" });
});

app.use("/movies", moviesRouter);
app.use("/actors", actorsRouter);

// These two must stay last: they handle whatever the routes above did not
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
