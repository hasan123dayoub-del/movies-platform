import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getGenres, getMoviesPage } from "@/lib/api";
import { readMovieFilters, readPage } from "@/lib/filters";
import type { MovieFilters as Filters } from "@/lib/types";
import MovieCard from "@/components/MovieCard";
import CatalogFilters from "@/components/filters/CatalogFilters";
import Pagination from "@/components/Pagination";
import PastLastPage from "@/components/PastLastPage";
import { toQuery } from "@/lib/api/query";

export const metadata: Metadata = { title: "Movies" };

// /movies?search=dark&type=Drama&sort=newest&page=2
export default async function MoviesPage({ searchParams }: PageProps<"/movies">) {
  const [params, genres] = await Promise.all([searchParams, getGenres()]);
  const filters = readMovieFilters(params);
  const page = readPage(params);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
          The full collection
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Movies</h1>
      </div>

      <CatalogFilters path="/movies" filters={filters} genres={genres} />

      {/* Only the results wait for the list; the filters above stay put. While you type,
          the old results stay on screen until the new ones arrive (no flashing) */}
      <Suspense fallback={<GridSkeleton />}>
        <MovieResults filters={filters} page={page} />
      </Suspense>
    </section>
  );
}

async function MovieResults({ filters, page }: { filters: Filters; page: number }) {
  const { data: movies, meta } = await getMoviesPage(filters, page);
  const isFiltered = Boolean(filters.search || filters.type);
  // The filters each page link keeps (the default sort stays out of the URL)
  const query = { search: filters.search, type: filters.type, sort: filters.sort === "title" ? undefined : filters.sort };

  // A page number past the end (an old link, or the list got shorter)
  if (movies.length === 0 && meta.total > 0) {
    return <PastLastPage href={`/movies${toQuery(query)}`} />;
  }

  if (movies.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-zinc-400">
        {isFiltered ? (
          <>
            No movies match
            {filters.search && <> &ldquo;{filters.search}&rdquo;</>}
            {filters.type && <> in {filters.type}</>}.{" "}
            <Link href="/movies" className="text-amber-400 hover:text-amber-300">
              Show all movies
            </Link>
          </>
        ) : (
          "No movies yet. Check back soon."
        )}
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-zinc-500" aria-live="polite">
        {meta.total} {meta.total === 1 ? "movie" : "movies"}
        {isFiltered && " found"}
      </p>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      <Pagination meta={meta} path="/movies" query={query} />
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-4 w-20 rounded bg-zinc-800" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="aspect-2/3 rounded-2xl bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
