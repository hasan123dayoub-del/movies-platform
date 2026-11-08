import Link from "next/link";
import { getMovies, getSeriesList } from "@/lib/api";
import MovieCard from "@/components/MovieCard";
import SeriesCard from "@/components/SeriesCard";
import Poster from "@/components/Poster";

export default async function Home() {
  const [movies, allSeries] = await Promise.all([getMovies(), getSeriesList({ sort: "rating" })]);
  const topSeries = allSeries.slice(0, 4);

  // Numbers for the stats row
  const averageRating =
    movies.length > 0
      ? movies.reduce((sum, movie) => sum + movie.rating, 0) / movies.length
      : 0;

  // Highest rated first; the top one gets the spotlight in the hero
  const topRated = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const featured = topRated[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        {featured?.posterUrl && (
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-20 blur-2xl"
            style={{ backgroundImage: `url(${featured.posterUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-zinc-950/40 to-zinc-950" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-20 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
              Now showing
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
              Discover your next favorite movie
            </h1>
            <p className="mt-4 max-w-xl text-lg text-zinc-400">
              Browse the collection, see who directed each film and meet the
              actors behind the roles.
            </p>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              <div>
                <dt className="text-sm text-zinc-500">Movies</dt>
                <dd className="mt-1 text-3xl font-bold">{movies.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Series</dt>
                <dd className="mt-1 text-3xl font-bold">{allSeries.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Avg rating</dt>
                <dd className="mt-1 text-3xl font-bold">
                  {averageRating.toFixed(1)}
                </dd>
              </div>
            </dl>
          </div>

          {featured && (
            <Link
              href={`/movies/${featured.id}`}
              className="group hidden w-56 md:block"
            >
              <div className="relative aspect-2/3 overflow-hidden rounded-2xl shadow-2xl shadow-black ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1">
                <Poster movie={featured} sizes="224px" eager />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-amber-400">
                Top rated
              </p>
              <p className="font-semibold transition group-hover:text-amber-400">
                {featured.title}
              </p>
            </Link>
          )}
        </div>
      </section>

      {/* Top rated (the full list lives on /movies) */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Top rated</h2>
          <Link
            href="/movies"
            className="text-sm font-medium text-amber-400 transition hover:text-amber-300"
          >
            View all {movies.length} movies →
          </Link>
        </div>

        {topRated.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-zinc-400">
            No movies yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {topRated.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* Top rated series (the full list lives on /series) */}
      {topSeries.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-semibold">Top rated series</h2>
            <Link
              href="/series"
              className="text-sm font-medium text-amber-400 transition hover:text-amber-300"
            >
              View all {allSeries.length} series →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {topSeries.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

