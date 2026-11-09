import { rankByMatch } from "./search.js";

// Pagination for the list endpoints, like Laravel's ->paginate():
//   GET /movies?page=2&perPage=12  ->  { data: [...12 movies], meta: { page: 2, perPage: 12, total: 35, totalPages: 3 } }
//   GET /movies                    ->  [...every movie]  (unchanged: the admin pages and dropdowns need the full list)

export type PageQuery = { page?: number | undefined; perPage: number; search?: string | undefined };

export type PageMeta = { page: number; perPage: number; total: number; totalPages: number };
export type Page<T> = { data: T[]; meta: PageMeta };

type ListOptions<T> = {
  query: PageQuery;
  // Reads the rows; with a range, only that slice (OFFSET/LIMIT in SQL)
  find: (range?: { skip: number; take: number }) => Promise<T[]>;
  // Counts every row that matches the filters (COUNT(*) in SQL)
  count: () => Promise<number>;
  // The text a search is ranked by (the title or the name)
  textOf: (item: T) => string;
};

function meta(page: number, perPage: number, total: number): PageMeta {
  // An empty list still has one (empty) page
  return { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function listOrPage<T>({ query, find, count, textOf }: ListOptions<T>): Promise<T[] | Page<T>> {
  const { page, perPage, search } = query;

  // No ?page: the whole list, as before
  if (!page) {
    const items = await find();
    return search ? rankByMatch(items, search, textOf) : items;
  }

  // A page without a search: the database returns only that page and counts the rest
  if (!search) {
    const [data, total] = await Promise.all([find({ skip: (page - 1) * perPage, take: perPage }), count()]);
    return { data, meta: meta(page, perPage, total) };
  }

  // A page of search results: the best matches must come first across ALL pages,
  // so rank every match (a search returns few rows), then cut out the page
  const ranked = rankByMatch(await find(), search, textOf);
  const start = (page - 1) * perPage;
  return { data: ranked.slice(start, start + perPage), meta: meta(page, perPage, ranked.length) };
}
