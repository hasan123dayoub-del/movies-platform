import { prisma } from "../lib/prisma.js";

// The admin dashboard numbers (GET /admin/stats). Every query runs at the same time.

const TOP = 5;

type TitleRef = { kind: "movie" | "series"; id: number; title: string; posterUrl: string | null };

// Titles by id, so the grouped rows below can show a title and a poster
async function titlesById(movieIds: number[], seriesIds: number[]) {
  const [movies, series] = await Promise.all([
    prisma.movie.findMany({ where: { id: { in: movieIds } }, select: { id: true, title: true, posterUrl: true } }),
    prisma.series.findMany({ where: { id: { in: seriesIds } }, select: { id: true, title: true, posterUrl: true } }),
  ]);
  return {
    movie: new Map(movies.map((m) => [m.id, { kind: "movie" as const, ...m }])),
    series: new Map(series.map((s) => [s.id, { kind: "series" as const, ...s }])),
  };
}

export async function getStats() {
  const [
    movies,
    series,
    seasons,
    episodes,
    actors,
    members,
    admins,
    reviews,
    watchlistItems,
    reviewAverage,
    movieRatings,
    seriesRatings,
    movieSaves,
    seriesSaves,
    latestReviews,
    newestMembers,
  ] = await Promise.all([
    prisma.movie.count(),
    prisma.series.count(),
    prisma.season.count(),
    prisma.episode.count(),
    prisma.actor.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.review.count(),
    prisma.watchlistItem.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
    // GROUP BY movieId: each movie's members' average and number of reviews
    prisma.review.groupBy({
      by: ["movieId"],
      where: { movieId: { not: null } },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.review.groupBy({
      by: ["seriesId"],
      where: { seriesId: { not: null } },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    // GROUP BY movieId on the watchlist: how many members saved each movie
    prisma.watchlistItem.groupBy({ by: ["movieId"], where: { movieId: { not: null } }, _count: { _all: true } }),
    prisma.watchlistItem.groupBy({ by: ["seriesId"], where: { seriesId: { not: null } }, _count: { _all: true } }),
    prisma.review.findMany({
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: TOP,
      include: {
        user: { select: { id: true, name: true } },
        movie: { select: { id: true, title: true } },
        series: { select: { id: true, title: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "USER" },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: TOP,
      select: { id: true, name: true, createdAt: true, _count: { select: { reviews: true, watchlist: true } } },
    }),
  ]);

  const titles = await titlesById(
    [...movieRatings, ...movieSaves].map((row) => row.movieId!),
    [...seriesRatings, ...seriesSaves].map((row) => row.seriesId!),
  );
  const titleOf = (kind: "movie" | "series", id: number): TitleRef | undefined =>
    kind === "movie" ? titles.movie.get(id) : titles.series.get(id);
  const oneDecimal = (n: number) => Math.round(n * 10) / 10;

  // Highest members' average first; more reviews wins a tie
  const topRated = [
    ...movieRatings.map((row) => ({ ref: titleOf("movie", row.movieId!), average: row._avg.rating!, count: row._count._all })),
    ...seriesRatings.map((row) => ({ ref: titleOf("series", row.seriesId!), average: row._avg.rating!, count: row._count._all })),
  ]
    .filter((row) => row.ref)
    .sort((a, b) => b.average - a.average || b.count - a.count)
    .slice(0, TOP)
    .map(({ ref, average, count }) => ({ ...ref!, average: oneDecimal(average), reviews: count }));

  const mostSaved = [
    ...movieSaves.map((row) => ({ ref: titleOf("movie", row.movieId!), saves: row._count._all })),
    ...seriesSaves.map((row) => ({ ref: titleOf("series", row.seriesId!), saves: row._count._all })),
  ]
    .filter((row) => row.ref)
    .sort((a, b) => b.saves - a.saves)
    .slice(0, TOP)
    .map(({ ref, saves }) => ({ ...ref!, saves }));

  return {
    counts: { movies, series, seasons, episodes, actors, members, admins, reviews, watchlistItems },
    averageReview: reviewAverage._avg.rating === null ? null : oneDecimal(reviewAverage._avg.rating),
    topRated,
    mostSaved,
    latestReviews: latestReviews.map(({ movie, series: show, ...review }) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      updatedAt: review.updatedAt,
      user: review.user,
      title: movie
        ? { kind: "movie" as const, id: movie.id, title: movie.title }
        : { kind: "series" as const, id: show!.id, title: show!.title },
    })),
    newestMembers: newestMembers.map(({ _count, ...user }) => ({
      ...user,
      reviews: _count.reviews,
      saved: _count.watchlist,
    })),
  };
}
