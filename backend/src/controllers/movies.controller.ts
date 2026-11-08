import type { Request, Response } from "express";
import * as moviesService from "../services/movies.service.js";
import type { MovieListQuery } from "../schemas/movie.schema.js";

// The controller only speaks HTTP: read the request, call the service, send the response.
// A 404 from the service is thrown and reaches the error handler by itself (Express 5).

// GET /movies?search=&type=&sort= (validate() put the clean query in res.locals)
export async function getMovies(req: Request, res: Response<unknown, { query: MovieListQuery }>) {
  res.json(await moviesService.listMovies(res.locals.query));
}

// GET /movies/:id
export async function getMovie(req: Request<{ id: string }>, res: Response) {
  res.json(await moviesService.getMovieWithCast(Number(req.params.id)));
}

// POST /movies
export async function createMovie(req: Request, res: Response) {
  const movie = await moviesService.createMovie(req.body);
  res.status(201).json(movie);
}

// PUT /movies/:id
export async function updateMovie(req: Request<{ id: string }>, res: Response) {
  res.json(await moviesService.updateMovie(Number(req.params.id), req.body));
}

// DELETE /movies/:id
export async function deleteMovie(req: Request<{ id: string }>, res: Response) {
  await moviesService.deleteMovie(Number(req.params.id));
  res.status(204).send();
}
