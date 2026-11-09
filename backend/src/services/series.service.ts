import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { listOrPage } from "../lib/paginate.js";
import { byMembersRating, withMemberRatings, type MemberRating } from "../lib/member-ratings.js";
import type { Prisma } from "../generated/prisma/client.js";
import type {
  CreateSeriesInput,
  SeriesListQuery,
  UpdateSeriesInput,
} from "../schemas/series.schema.js";

// Like Series::findOrFail($id)
export async function findSeriesOrFail(id: number) {
  const series = await prisma.series.findUnique({ where: { id } });
  if (!series) {
    throw new HttpError(404, "Series not found");
  }
  return series;
}

// Same sorts as movies; "newest" = the most recent first year
const ORDER_BY = {
  title: [{ title: "asc" }],
  rating: [{ rating: "desc" }, { title: "asc" }],
  members: [{ title: "asc" }],
  newest: [{ startYear: "desc" }, { title: "asc" }],
} satisfies Record<SeriesListQuery["sort"], Prisma.SeriesOrderByWithRelationInput[]>;

// GET /series?search=bad&type=Drama&sort=newest. Each item also says how many
// seasons and episodes it has, for the cards ("5 seasons · 62 episodes")
export async function listSeries(query: SeriesListQuery) {
  const { search, type, sort } = query;
  const where: Prisma.SeriesWhereInput = {};
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (type) {
    where.type = { equals: type, mode: "insensitive" };
  }

  // Each series with how many seasons and episodes it has
  const find = async (range?: { skip: number; take: number }) => {
    const rows = await prisma.series.findMany({
      where,
      orderBy: ORDER_BY[sort],
      include: {
        _count: { select: { seasons: true } },
        seasons: { select: { _count: { select: { episodes: true } } } },
      },
      ...range,
    });
    return rows.map(({ _count, seasons, ...series }) => ({
      ...series,
      seasonCount: _count.seasons,
      episodeCount: seasons.reduce((sum, season) => sum + season._count.episodes, 0),
    }));
  };

  // The full list, or one page of it with ?page
  type Row = Awaited<ReturnType<typeof find>>[number];
  return listOrPage<Row, Row & MemberRating>({
    query,
    find,
    count: () => prisma.series.count({ where }),
    textOf: (series) => series.title,
    decorate: (list) => withMemberRatings("series", list),
    sortInMemory: sort === "members" ? byMembersRating : undefined,
  });
}

// The series with everything: seasons (in order) with their episodes, and the cast
export async function getSeriesWithDetails(id: number) {
  const series = await prisma.series.findUnique({
    where: { id },
    include: {
      seasons: {
        orderBy: { number: "asc" },
        include: { episodes: { orderBy: { number: "asc" } } },
      },
      actors: { include: { actor: true }, orderBy: { actor: { name: "asc" } } },
    },
  });
  if (!series) {
    throw new HttpError(404, "Series not found");
  }
  return series;
}

export function createSeries(data: CreateSeriesInput) {
  return prisma.series.create({ data });
}

export async function updateSeries(id: number, data: UpdateSeriesInput) {
  const current = await findSeriesOrFail(id);

  // Only one of the years may be sent: check it against the saved other one
  const startYear = data.startYear ?? current.startYear;
  const endYear = data.endYear === undefined ? current.endYear : data.endYear;
  if (endYear !== null && endYear < startYear) {
    throw new HttpError(400, "Last year can't be before the first year");
  }

  return prisma.series.update({ where: { id }, data });
}

export async function deleteSeries(id: number) {
  await findSeriesOrFail(id);
  // Its seasons, episodes and cast links go with it (onDelete: Cascade)
  await prisma.series.delete({ where: { id } });
}
