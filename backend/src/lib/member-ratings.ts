import { prisma } from "./prisma.js";

// The members' average and number of reviews, added to each movie or series in a list
export type MemberRating = { membersRating: number | null; reviewCount: number };

// One GROUP BY query for the whole list (not one query per title)
export async function withMemberRatings<T extends { id: number }>(
  kind: "movie" | "series",
  items: T[],
): Promise<(T & MemberRating)[]> {
  if (items.length === 0) {
    return [];
  }
  const ids = items.map((item) => item.id);
  const rows =
    kind === "movie"
      ? (
          await prisma.review.groupBy({
            by: ["movieId"],
            where: { movieId: { in: ids } },
            _avg: { rating: true },
            _count: { _all: true },
          })
        ).map((row) => ({ id: row.movieId!, average: row._avg.rating, count: row._count._all }))
      : (
          await prisma.review.groupBy({
            by: ["seriesId"],
            where: { seriesId: { in: ids } },
            _avg: { rating: true },
            _count: { _all: true },
          })
        ).map((row) => ({ id: row.seriesId!, average: row._avg.rating, count: row._count._all }));

  const byId = new Map(rows.map((row) => [row.id, row]));
  return items.map((item) => {
    const row = byId.get(item.id);
    return {
      ...item,
      // One decimal, like the catalog ratings
      membersRating: row?.average == null ? null : Math.round(row.average * 10) / 10,
      reviewCount: row?.count ?? 0,
    };
  });
}

// ?sort=members: the highest members' average first, then more reviews first;
// titles nobody rated yet go last. Array.sort is stable, so ties keep the A to Z order.
export function byMembersRating(a: MemberRating, b: MemberRating) {
  if (a.membersRating === null || b.membersRating === null) {
    return Number(a.membersRating === null) - Number(b.membersRating === null);
  }
  return b.membersRating - a.membersRating || b.reviewCount - a.reviewCount;
}
