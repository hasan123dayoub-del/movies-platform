import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import type { CreateMovieInput, UpdateMovieInput } from "../schemas/movie.schema.js";

// Like Movie::findOrFail($id)
export async function findMovieOrFail(id: number) {
  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) {
    throw new HttpError(404, "Movie not found");
  }
  return movie;
}

export function listMovies() {
  return prisma.movie.findMany({ orderBy: { id: "asc" } });
}

// The movie with its cast (each actor and their role)
export async function getMovieWithCast(id: number) {
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: { actors: { include: { actor: true } } },
  });
  if (!movie) {
    throw new HttpError(404, "Movie not found");
  }
  return movie;
}

export function createMovie(data: CreateMovieInput) {
  return prisma.movie.create({ data });
}

export async function updateMovie(id: number, data: UpdateMovieInput) {
  await findMovieOrFail(id);
  return prisma.movie.update({ where: { id }, data });
}

export async function deleteMovie(id: number) {
  await findMovieOrFail(id);
  await prisma.movie.delete({ where: { id } });
}
