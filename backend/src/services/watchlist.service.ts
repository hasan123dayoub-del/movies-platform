import { prisma } from "../lib/prisma.js";
import { findTitleOrFail, titleColumn, type Title } from "./reviews.service.js";

// GET /watchlist: everything the member saved, the latest first, split into
// movies and series (each item is the full title, ready to show as a card)
export async function getWatchlist(userId: number) {
  const items = await prisma.watchlistItem.findMany({
    where: { userId },
    include: { movie: true, series: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  return {
    movies: items.flatMap((item) => (item.movie ? [{ ...item.movie, addedAt: item.createdAt }] : [])),
    series: items.flatMap((item) => (item.series ? [{ ...item.series, addedAt: item.createdAt }] : [])),
  };
}

// PUT /watchlist/movies/:id: save a title. Saving it twice is fine (nothing changes),
// so the button can't fail on a double click.
export async function addToWatchlist(userId: number, title: Title) {
  await findTitleOrFail(title);
  const where = { userId, ...titleColumn(title) };
  const existing = await prisma.watchlistItem.findFirst({ where, select: { id: true } });
  if (!existing) {
    // A second request racing this one is stopped by the unique rule; then it's saved anyway
    await prisma.watchlistItem.create({ data: where }).catch((error: unknown) => {
      if ((error as { code?: string }).code !== "P2002") throw error;
    });
  }
}

// DELETE /watchlist/movies/:id: take a title off the list (fine if it wasn't there)
export async function removeFromWatchlist(userId: number, title: Title) {
  await findTitleOrFail(title);
  await prisma.watchlistItem.deleteMany({ where: { userId, ...titleColumn(title) } });
}
