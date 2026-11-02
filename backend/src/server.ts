import express from "express";
import moviesRouter from "./routes/movies.routes.js";
import actorsRouter from "./routes/actors.routes.js";


const app = express();
const PORT = 4000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Movies API is running" });
});

app.use("/movies", moviesRouter);
app.use("/actors", actorsRouter);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
