import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { findMovieOrFail } from "./movies.service.js";
import { findSeriesOrFail } from "./series.service.js";
import type { ReviewListQuery, SaveReviewInput } from "../schemas/review.schema.js";

// What a review (or a watchlist item) is about: a movie or a series.
// The same code serves both, like a polymorphic relation in Laravel.
export type Title = { kind: "movie"; id: number } | { kind: "series"; id: number };

// The column that points at the title: { movieId: 3 } or { seriesId: 3 }
export function titleColumn(title: Title) {
  return title.kind === "movie" ? { movieId: title.id } : { seriesId: title.id };
}

// 404 if the movie or series doesn't exist
export async function findTitleOrFail(title: Title) {
  return title.kind === "movie" ? findMovieOrFail(title.id) : findSeriesOrFail(title.id);
}

// The reviewer's name goes with each review, never their email
const withReviewer = { user: { select: { id: true, name: true } } } as const;

// GET /movies/:id/reviews: the members' average and count, then one page of reviews,
// the most recently written or changed first
export async function listReviews(title: Title, { page, perPage }: ReviewListQuery) {
  await findTitleOrFail(title);
  const where = titleColumn(title);

  const [stats, data] = await Promise.all([
    prisma.review.aggregate({ where, _avg: { rating: true }, _count: true }),
    prisma.review.findMany({
      where,
      include: withReviewer,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  const count = stats._count;
  // One decimal, like the catalog ratings (8.666 -> 8.7); null while nobody has rated
  const average = stats._avg.rating === null ? null : Math.round(stats._avg.rating * 10) / 10;
  return {
    stats: { average, count },
    data,
    meta: { page, perPage, total: count, totalPages: Math.max(1, Math.ceil(count / perPage)) },
  };
}

// GET /movies/:id/reviews/me: the visitor's own review, 404 if they haven't written one
export async function getMyReview(title: Title, userId: number) {
  await findTitleOrFail(title);
  const review = await prisma.review.findFirst({
    where: { userId, ...titleColumn(title) },
    include: withReviewer,
  });
  if (!review) {
    throw new HttpError(404, "You haven't reviewed this yet");
  }
  return review;
}

// PUT /movies/:id/reviews: write the review, or change it if it exists (one per member).
// "created" tells the controller whether to answer 201 or 200.
export async function saveMyReview(title: Title, userId: number, input: SaveReviewInput) {
  await findTitleOrFail(title);
  const where = { userId, ...titleColumn(title) };

  const existing = await prisma.review.findFirst({ where, select: { id: true } });
  if (existing) {
    const review = await prisma.review.update({ where: { id: existing.id }, data: input, include: withReviewer });
    return { review, created: false };
  }
  // Two quick clicks could both get here; the unique rule then answers 409 for the second
  const review = await prisma.review.create({ data: { ...where, ...input }, include: withReviewer });
  return { review, created: true };
}

// DELETE /movies/:id/reviews: remove the visitor's own review
export async function deleteMyReview(title: Title, userId: number) {
  await findTitleOrFail(title);
  const { count } = await prisma.review.deleteMany({ where: { userId, ...titleColumn(title) } });
  if (count === 0) {
    throw new HttpError(404, "You haven't reviewed this yet");
  }
}

// DELETE /reviews/:id (admins): remove anyone's review, e.g. a rude one.
// A missing id throws Prisma's P2025, which the error handler turns into a 404.
export async function deleteReview(id: number) {
  await prisma.review.delete({ where: { id } });
}
