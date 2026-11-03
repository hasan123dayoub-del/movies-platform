import Link from "next/link";
import { getMovies } from "@/lib/api";
import MovieCard from "@/components/MovieCard";
import Poster from "@/components/Poster";

export default async function Home() {
  const movies = await getMovies();

  // Numbers for the stats row
  const genres = new Set(movies.map((movie) => movie.type)).size;
  const averageRating =
    movies.length > 0
      ? movies.reduce((sum, movie) => sum + movie.rating, 0) / movies.length
      : 0;

  // The highest rated movie gets the spotlight in the hero
  const featured = movies.reduce<(typeof movies)[number] | null>(
    (best, movie) => (!best || movie.rating > best.rating ? movie : best),
    null,
  );

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
                <dt className="text-sm text-zinc-500">Genres</dt>
                <dd className="mt-1 text-3xl font-bold">{genres}</dd>
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
                <Poster movie={featured} sizes="224px" priority />
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

      {/* Movies grid */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">All movies</h2>
          <p className="text-sm text-zinc-500">{movies.length} titles</p>
        </div>

        {movies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-zinc-400">
            No movies yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
