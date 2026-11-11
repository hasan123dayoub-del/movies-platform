import { cacheLife } from "next/cache";
import type { TitleKind, WhereToWatch } from "../types";
import { getJson } from "./client";

// Offers change slowly; the API also keeps TMDB's answer for 12 hours
async function fetchWhereToWatch(kind: TitleKind, id: number, country: string) {
  "use cache";
  cacheLife("hours");
  const base = kind === "movie" ? "movies" : "series";
  const query = country ? `?country=${encodeURIComponent(country)}` : "";
  return getJson<WhereToWatch>(`/${base}/${id}/where-to-watch${query}`, "Failed to load where to watch");
}

// Where a movie or series can be watched in a country, or null when that can't be
// known right now (TMDB down, or no token on the server): the page then leaves the
// section out instead of failing. A failure is not cached, so the next visit tries again.
export async function getWhereToWatch(kind: TitleKind, id: number, country = ""): Promise<WhereToWatch | null> {
  try {
    return await fetchWhereToWatch(kind, id, country);
  } catch {
    return null;
  }
}
