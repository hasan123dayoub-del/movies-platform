import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovie } from "@/lib/api";
import { formatDate } from "@/lib/format";
import Poster from "@/components/Poster";
import ActorAvatar from "@/components/ActorAvatar";

export default async function MoviePage({ params }: PageProps<"/movies/[id]">) {
  const { id } = await params;

  // /movies/abc -> 404 without calling the API
  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const movie = await getMovie(Number(id));
  if (!movie) {
    notFound();
  }

  return (
    <>
      {/* Header with the blurred poster behind it */}
      <section className="relative overflow-hidden border-b border-white/10">
        {movie.posterUrl && (
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-25 blur-2xl"
            style={{ backgroundImage: `url(${movie.posterUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-zinc-950/30 to-zinc-950" />

        <div className="relative mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <Link
            href="/"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← All movies
          </Link>

          <div className="mt-8 grid gap-8 sm:grid-cols-[220px_1fr] md:grid-cols-[260px_1fr] md:gap-12">
            <div className="relative aspect-2/3 w-48 overflow-hidden rounded-2xl shadow-2xl shadow-black ring-1 ring-white/10 sm:w-full">
              <Poster movie={movie} sizes="260px" priority />
            </div>

            <div className="self-end">
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
                {movie.type}
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                {movie.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl text-amber-400">★</span>
                  <span className="text-3xl font-bold">
                    {movie.rating.toFixed(1)}
                  </span>
                  <span className="text-zinc-500">/10</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Director
                  </p>
                  <p className="font-medium">{movie.director}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Cast
                  </p>
                  <p className="font-medium">
                    {movie.actors.length}{" "}
                    {movie.actors.length === 1 ? "actor" : "actors"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cast */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-semibold">Cast</h2>

        {movie.actors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-zinc-400">
            No cast has been added to this movie yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {movie.actors.map(({ actor, role }) => (
              <Link
                key={actor.id}
                href={`/actors/${actor.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-white/20 hover:bg-zinc-800/80"
              >
                <ActorAvatar actor={actor} />
                <div className="min-w-0">
                  <p className="truncate font-semibold transition group-hover:text-amber-400">
                    {actor.name}
                  </p>
                  <p className="truncate text-sm text-zinc-400">as {role}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {actor.nationality} · Born {formatDate(actor.birthday)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
