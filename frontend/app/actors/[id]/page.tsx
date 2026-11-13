import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActor } from "@/lib/api";
import { formatDate, getAge } from "@/lib/format";
import { getToday } from "@/lib/today";
import ActorAvatar from "@/components/ActorAvatar";
import MovieCard from "@/components/MovieCard";
import SeriesCard from "@/components/SeriesCard";

// /actors/abc -> 404 without calling the API
async function loadActor(id: string) {
  if (!/^\d+$/.test(id)) {
    notFound();
  }
  const actor = await getActor(Number(id));
  if (!actor) {
    notFound();
  }
  return actor;
}

// The browser tab and link previews show the actor's name and photo
export async function generateMetadata({
  params,
}: PageProps<"/actors/[id]">): Promise<Metadata> {
  const actor = await loadActor((await params).id);
  const count = actor.movies.length;
  return {
    title: actor.name,
    description: `${actor.name} (${actor.nationality}), in ${count} ${count === 1 ? "movie" : "movies"} and ${actor.series.length} series on Movies Platform.`,
    openGraph: actor.photoUrl ? { images: [actor.photoUrl] } : null,
  };
}

export default async function ActorPage({ params }: PageProps<"/actors/[id]">) {
  const [actor, today] = await Promise.all([loadActor((await params).id), getToday()]);

  // Average over everything they played in, movies and series together
  const ratings = [
    ...actor.movies.map(({ movie }) => movie.rating),
    ...actor.series.map(({ series }) => series.rating),
  ];
  const averageRating =
    ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null;

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
            <ActorAvatar actor={actor} size="lg" />
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
                    {formatDate(actor.birthday)}
                    {/* No age for an actor who has died */}
                    {!actor.deathDate && ` (${getAge(actor.birthday, today)})`}
                  </dd>
                </div>
                {actor.deathDate && (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-zinc-500">
                      Died
                    </dt>
                    <dd className="font-medium">{formatDate(actor.deathDate)}</dd>
                  </div>
                )}
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
                <div>
                  <dt className="text-xs uppercase tracking-wider text-zinc-500">
                    Series
                  </dt>
                  <dd className="font-medium">{actor.series.length}</dd>
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

      {/* Filmography: movies, then TV series (a section only shows if it has something) */}
      <section className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        {actor.movies.length === 0 && actor.series.length === 0 && (
          <>
            <h2 className="text-2xl font-semibold">Filmography</h2>
            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-zinc-400">
              This actor hasn&apos;t been added to any movie or series yet.
            </div>
          </>
        )}

        {actor.movies.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold">Movies</h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {actor.movies.map(({ movie, role }) => (
                <MovieCard key={movie.id} movie={movie} subtitle={`as ${role}`} />
              ))}
            </div>
          </div>
        )}

        {actor.series.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold">TV Series</h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {actor.series.map(({ series, role }) => (
                <SeriesCard key={series.id} series={series} subtitle={`as ${role}`} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
