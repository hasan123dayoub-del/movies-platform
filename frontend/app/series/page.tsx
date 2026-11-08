import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getSeriesGenres, getSeriesList } from "@/lib/api";
import { readSeriesFilters } from "@/lib/filters";
import type { SeriesFilters } from "@/lib/types";
import SeriesCard from "@/components/SeriesCard";
import CatalogFilters from "@/components/filters/CatalogFilters";

export const metadata: Metadata = { title: "TV Series" };

// /series?search=bad&type=Drama&sort=newest (same live search as /movies)
export default async function SeriesPage({ searchParams }: PageProps<"/series">) {
  const [filters, genres] = await Promise.all([
    searchParams.then(readSeriesFilters),
    getSeriesGenres(),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
          Season by season
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">TV Series</h1>
      </div>

      <CatalogFilters path="/series" filters={filters} genres={genres} />

      <Suspense fallback={<GridSkeleton />}>
        <SeriesResults filters={filters} />
      </Suspense>
    </section>
  );
}

async function SeriesResults({ filters }: { filters: SeriesFilters }) {
  const list = await getSeriesList(filters);
  const isFiltered = Boolean(filters.search || filters.type);

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-zinc-400">
        {isFiltered ? (
          <>
            No series match
            {filters.search && <> &ldquo;{filters.search}&rdquo;</>}
            {filters.type && <> in {filters.type}</>}.{" "}
            <Link href="/series" className="text-amber-400 hover:text-amber-300">
              Show all series
            </Link>
          </>
        ) : (
          "No series yet. Check back soon."
        )}
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-zinc-500" aria-live="polite">
        {list.length} series{isFiltered && " found"}
      </p>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((series) => (
          <SeriesCard key={series.id} series={series} />
        ))}
      </div>
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
