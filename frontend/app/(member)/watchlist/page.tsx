import type { Metadata } from "next";
import Link from "next/link";
import { getWatchlist } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import MovieCard from "@/components/MovieCard";
import SeriesCard from "@/components/SeriesCard";

export const metadata: Metadata = { title: "My watchlist" };

// /watchlist: the movies and series this member saved for later.
// proxy.ts already sent visitors without a session to the login page.
export default async function WatchlistPage() {
  const user = await requireUser("/watchlist");
  const list = (await getWatchlist()) ?? { movies: [], series: [] };
  const total = list.movies.length + list.series.length;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
          Saved for later
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">My watchlist</h1>
        <p className="mt-2 text-zinc-400">
          {user.name}, you have {total} {total === 1 ? "title" : "titles"} saved.
        </p>
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-zinc-400">
          Nothing here yet. Press <span className="text-zinc-200">+ Watchlist</span> on any{" "}
          <Link href="/movies" className="text-amber-400 hover:text-amber-300">
            movie
          </Link>{" "}
          or{" "}
          <Link href="/series" className="text-amber-400 hover:text-amber-300">
            series
          </Link>{" "}
          to save it here.
        </div>
      ) : (
        <div className="space-y-12">
          {list.movies.length > 0 && (
            <div>
              <h2 className="mb-5 text-2xl font-semibold">Movies</h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {list.movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} subtitle={`Added ${formatDate(movie.addedAt)}`} />
                ))}
              </div>
            </div>
          )}
          {list.series.length > 0 && (
            <div>
              <h2 className="mb-5 text-2xl font-semibold">Series</h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {list.series.map((series) => (
                  <SeriesCard key={series.id} series={series} subtitle={`Added ${formatDate(series.addedAt)}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
