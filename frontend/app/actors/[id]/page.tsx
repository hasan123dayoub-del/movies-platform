import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor } from "@/lib/api";
import { formatDate, getAge } from "@/lib/format";
import ActorAvatar from "@/components/ActorAvatar";
import MovieCard from "@/components/MovieCard";

export default async function ActorPage({ params }: PageProps<"/actors/[id]">) {
  const { id } = await params;

  // /actors/abc -> 404 without calling the API
  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const actor = await getActor(Number(id));
  if (!actor) {
    notFound();
  }

  const averageRating =
    actor.movies.length > 0
      ? actor.movies.reduce((sum, { movie }) => sum + movie.rating, 0) /
        actor.movies.length
      : null;

  return (
    <>
      {/* Profile */}
      <section className="border-b border-white/10 bg-linear-to-b from-amber-400/10 to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <Link
            href="/actors"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← All actors
          </Link>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <ActorAvatar name={actor.name} size="lg" />
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {actor.name}
              </h1>
              <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-zinc-500">
                    Born
                  </dt>
                  <dd className="font-medium">
                    {formatDate(actor.birthday)} ({getAge(actor.birthday)})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-zinc-500">
                    Nationality
                  </dt>
                  <dd className="font-medium">{actor.nationality}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-zinc-500">
                    Movies
                  </dt>
                  <dd className="font-medium">{actor.movies.length}</dd>
                </div>
                {averageRating !== null && (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-zinc-500">
                      Avg rating
                    </dt>
                    <dd className="font-medium">
                      <span className="text-amber-400">★</span>{" "}
                      {averageRating.toFixed(1)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Filmography */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-semibold">Filmography</h2>

        {actor.movies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-zinc-400">
            This actor hasn&apos;t been added to any movie yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {actor.movies.map(({ movie, role }) => (
              <MovieCard key={movie.id} movie={movie} subtitle={`as ${role}`} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
