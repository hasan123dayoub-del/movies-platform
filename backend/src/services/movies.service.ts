import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { rankByMatch } from "../lib/search.js";
import type { Prisma } from "../generated/prisma/client.js";
import type {
  CreateMovieInput,
  MovieListQuery,
  UpdateMovieInput,
} from "../schemas/movie.schema.js";

// Like Movie::findOrFail($id)
export async function findMovieOrFail(id: number) {
  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) {
    throw new HttpError(404, "Movie not found");
  }
  return movie;
}

// How each ?sort= value orders the list. A movie with no release year goes last in "newest".
// The title is always the tie-breaker, so equal ratings or years keep a stable order.
const ORDER_BY = {
  title: [{ title: "asc" }],
  rating: [{ rating: "desc" }, { title: "asc" }],
  newest: [{ releaseYear: { sort: "desc", nulls: "last" } }, { title: "asc" }],
} satisfies Record<MovieListQuery["sort"], Prisma.MovieOrderByWithRelationInput[]>;

// GET /movies?search=dark&type=Drama&sort=newest (every filter is optional)
export async function listMovies({ search, type, sort }: MovieListQuery) {
  const where: Prisma.MovieWhereInput = {};
  if (search) {
    // ILIKE '%dark%' in SQL: part of the title, any case
    where.title = { contains: search, mode: "insensitive" };
  }
  if (type) {
    // "drama" finds "Drama" too
    where.type = { equals: type, mode: "insensitive" };
  }
  const movies = await prisma.movie.findMany({ where, orderBy: ORDER_BY[sort] });
  // While searching, titles that start with the text come first
  return search ? rankByMatch(movies, search, (movie) => movie.title) : movies;
}

// The movie with its cast (each actor and their role), actors A to Z
export async function getMovieWithCast(id: number) {
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: { actors: { include: { actor: true }, orderBy: { actor: { name: "asc" } } } },
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
