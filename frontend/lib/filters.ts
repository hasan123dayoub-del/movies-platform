import { MOVIE_SORTS, type MovieFilters, type MovieSort } from "./types";

// What Next gives a page in `searchParams`: ?a=1 -> "1", ?a=1&a=2 -> ["1", "2"]
type SearchParams = Record<string, string | string[] | undefined>;

// One clean, trimmed value, or undefined (the first one if the URL repeats the key)
function first(value: string | string[] | undefined) {
  const text = (Array.isArray(value) ? value[0] : value)?.trim();
  return text ? text.slice(0, 100) : undefined;
}

// Turns the URL of /movies into filters the API accepts.
// Anything unknown (?sort=oops) falls back to the default instead of an error page.
export function readMovieFilters(params: SearchParams): Required<Pick<MovieFilters, "sort">> & MovieFilters {
  const sort = first(params.sort);
  return {
    search: first(params.search),
    type: first(params.type),
    sort: sort && sort in MOVIE_SORTS ? (sort as MovieSort) : "title",
  };
}

// Series lists read the URL the same way
export const readSeriesFilters = readMovieFilters;

export function readSearch(params: SearchParams) {
  return first(params.search);
}

// ?page=3 -> 3. Anything else (missing, 0, "abc", 2.5) is page 1
export function readPage(params: SearchParams) {
  const page = Number(first(params.page));
  return Number.isInteger(page) && page > 1 ? page : 1;
}
