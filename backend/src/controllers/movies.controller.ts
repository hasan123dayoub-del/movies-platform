import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /movies
export async function getMovies(req: Request, res: Response) {
  const movies = await prisma.movie.findMany({
    orderBy: { id: "asc" },
  });

  res.json(movies);
}

// GET /movies/:id
export async function getMovie(req: Request<{ id: string }>, res: Response) {
  const movie = await prisma.movie.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      actors: {
        include: { actor: true },
      },
    },
  });

  if (!movie) {
    res.status(404).json({ message: "Movie not found" });
    return;
  }

  res.json(movie);
}

// POST /movies
export async function createMovie(req: Request, res: Response) {
  const { title, type, rating, director, posterUrl } = req.body;

  const movie = await prisma.movie.create({
    data: { title, type, rating, director, posterUrl },
  });

  res.status(201).json(movie);
}

// PUT /movies/:id
export async function updateMovie(req: Request<{ id: string }>, res: Response) {
  const id = Number(req.params.id);

  const exists = await prisma.movie.findUnique({ where: { id } });
  if (!exists) {
    res.status(404).json({ message: "Movie not found" });
    return;
  }

  const { title, type, rating, director, posterUrl } = req.body;

  const movie = await prisma.movie.update({
    where: { id },
    data: { title, type, rating, director, posterUrl },
  });

  res.json(movie);
}

// DELETE /movies/:id
export async function deleteMovie(req: Request<{ id: string }>, res: Response) {
  const id = Number(req.params.id);

  const exists = await prisma.movie.findUnique({ where: { id } });
  if (!exists) {
    res.status(404).json({ message: "Movie not found" });
    return;
  }

  await prisma.movie.delete({ where: { id } });

  res.status(204).send();
}
