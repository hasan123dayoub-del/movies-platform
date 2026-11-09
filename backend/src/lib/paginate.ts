import { rankByMatch } from "./search.js";

// Pagination for the list endpoints, like Laravel's ->paginate():
//   GET /movies?page=2&perPage=12  ->  { data: [...12 movies], meta: { page: 2, perPage: 12, total: 35, totalPages: 3 } }
//   GET /movies                    ->  [...every movie]  (unchanged: the admin pages and dropdowns need the full list)

export type PageQuery = { page?: number | undefined; perPage: number; search?: string | undefined };

export type PageMeta = { page: number; perPage: number; total: number; totalPages: number };
export type Page<T> = { data: T[]; meta: PageMeta };

type ListOptions<T, U extends T> = {
  query: PageQuery;
  // Reads the rows; with a range, only that slice (OFFSET/LIMIT in SQL)
  find: (range?: { skip: number; take: number }) => Promise<T[]>;
  // Counts every row that matches the filters (COUNT(*) in SQL)
  count: () => Promise<number>;
  // The text a search is ranked by (the title or the name)
  textOf: (item: T) => string;
  // Adds data from other tables to the rows that are sent (e.g. the members' rating)
  decorate: (items: T[]) => Promise<U[]>;
  // An order the database can't give (e.g. by the members' average): then every row
  // is read and sorted here before the page is cut
  sortInMemory?: ((a: U, b: U) => number) | undefined;
};

function meta(page: number, perPage: number, total: number): PageMeta {
  // An empty list still has one (empty) page
  return { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

function cut<U>(items: U[], page: number, perPage: number): Page<U> {
  const start = (page - 1) * perPage;
  return { data: items.slice(start, start + perPage), meta: meta(page, perPage, items.length) };
}

export async function listOrPage<T, U extends T>({
  query,
  find,
  count,
  textOf,
  decorate,
  sortInMemory,
}: ListOptions<T, U>): Promise<U[] | Page<U>> {
  const { page, perPage, search } = query;
  // While searching, titles that start with the text come first (a stable sort, so
  // inside each group the chosen order stays)
  const rank = <V extends T>(items: V[]) => (search ? rankByMatch(items, search, textOf) : items);

  // Sorted here: read everything, sort, rank, then cut the page
  if (sortInMemory) {
    const sorted = rank((await decorate(await find())).sort(sortInMemory));
    return page ? cut(sorted, page, perPage) : sorted;
  }

  // No ?page: the whole list, as before
  if (!page) {
    return decorate(rank(await find()));
  }

  // A page without a search: the database returns only that page and counts the rest
  if (!search) {
    const [rows, total] = await Promise.all([find({ skip: (page - 1) * perPage, take: perPage }), count()]);
    return { data: await decorate(rows), meta: meta(page, perPage, total) };
  }

  // A page of search results: the best matches must come first across ALL pages,
  // so rank every match (a search returns few rows), then cut out the page
  const { data, meta: pageMeta } = cut(rank(await find()), page, perPage);
  return { data: await decorate(data), meta: pageMeta };
}
