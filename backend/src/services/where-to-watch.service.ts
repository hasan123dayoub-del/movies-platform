import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import { HttpError } from "../lib/http-error.js";
import type { Title } from "./reviews.service.js";

// Where a movie or series can be watched legally, country by country: streaming
// services, free ones, rentals and purchases. The data is JustWatch's, served by
// TMDB (themoviedb.org) for free with an API token.

export type Provider = { id: number; name: string; logo: string | null };

export type WhereToWatch = {
  // The country these offers are for (ISO code, e.g. "SA")
  country: string;
  // Every country that has offers for this title, so the site can offer a choice
  countries: string[];
  // TMDB's page for this title's offers in that country (it links to each service)
  link: string | null;
  stream: Provider[];
  free: Provider[];
  ads: Provider[];
  rent: Provider[];
  buy: Provider[];
};

type TmdbProvider = { provider_id: number; provider_name: string; logo_path: string | null; display_priority: number };
type TmdbCountry = Partial<Record<"flatrate" | "free" | "ads" | "rent" | "buy", TmdbProvider[]>> & { link?: string };
type TmdbAnswer = { results?: Record<string, TmdbCountry> };

// Offers change slowly: ask TMDB again after 12 hours, so pages don't call it every time
const CACHE_MS = 12 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; results: Record<string, TmdbCountry> }>();
const FALLBACK_COUNTRY = "US";

async function offersOf(kind: Title["kind"], tmdbId: number) {
  const key = `${kind}:${tmdbId}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return hit.results;
  }
  if (!env.TMDB_TOKEN) {
    throw new HttpError(503, "Where to watch is not set up on this server");
  }

  const path = kind === "movie" ? "movie" : "tv";
  let answer: Response;
  try {
    answer = await fetch(`https://api.themoviedb.org/3/${path}/${tmdbId}/watch/providers`, {
      headers: { Authorization: `Bearer ${env.TMDB_TOKEN}`, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new HttpError(502, "Couldn't reach TMDB, please try again");
  }
  if (!answer.ok) {
    throw new HttpError(502, "Couldn't reach TMDB, please try again");
  }
  const results = ((await answer.json()) as TmdbAnswer).results ?? {};
  cache.set(key, { at: Date.now(), results });
  return results;
}

// TMDB lists them in its own order of importance
function providers(list: TmdbProvider[] | undefined): Provider[] {
  return [...(list ?? [])]
    .sort((a, b) => a.display_priority - b.display_priority)
    .map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
    }));
}

// GET /movies/:id/where-to-watch?country=SA
// Without a country, or with one that has no offers, it answers for the US
// (or the first country that has any) and says which one in `country`.
export async function getWhereToWatch(title: Title, country: string | undefined): Promise<WhereToWatch> {
  const row =
    title.kind === "movie"
      ? await prisma.movie.findUnique({ where: { id: title.id }, select: { tmdbId: true } })
      : await prisma.series.findUnique({ where: { id: title.id }, select: { tmdbId: true } });
  if (!row) {
    throw new HttpError(404, `${title.kind === "movie" ? "Movie" : "Series"} not found`);
  }

  const results = row.tmdbId ? await offersOf(title.kind, row.tmdbId) : {};
  const countries = Object.keys(results).sort();
  const chosen =
    country && results[country]
      ? country
      : results[FALLBACK_COUNTRY]
        ? FALLBACK_COUNTRY
        : (countries[0] ?? country ?? FALLBACK_COUNTRY);
  const offers = results[chosen] ?? {};

  return {
    country: chosen,
    countries,
    link: offers.link ?? null,
    stream: providers(offers.flatrate),
    free: providers(offers.free),
    ads: providers(offers.ads),
    rent: providers(offers.rent),
    buy: providers(offers.buy),
  };
}
