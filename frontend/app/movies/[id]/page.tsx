import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMovie } from "@/lib/api";
import { formatDate, formatRuntime } from "@/lib/format";
import Poster from "@/components/Poster";
import ActorAvatar from "@/components/ActorAvatar";
import ReviewsSection, { MembersRating } from "@/components/reviews/ReviewsSection";
import WatchlistButton, { WatchlistButtonSkeleton } from "@/components/reviews/WatchlistButton";
import VideoPlayer from "@/components/video/VideoPlayer";
import Trailer from "@/components/video/Trailer";

// /movies/abc -> 404 without calling the API
async function loadMovie(id: string) {
  if (!/^\d+$/.test(id)) {
    notFound();
  }
  const movie = await getMovie(Number(id));
  if (!movie) {
    notFound();
  }
  return movie;
}

// The browser tab and link previews show the movie's own title and poster.
// Next remembers the GET during one request, so the page below doesn't fetch twice.
export async function generateMetadata({
  params,
}: PageProps<"/movies/[id]">): Promise<Metadata> {
  const movie = await loadMovie((await params).id);
  return {
    title: movie.title,
    // The movie's own summary when it has one (shown under the link in search and chat apps)
    description:
      movie.description ??
      `${movie.title}: a ${movie.type.toLowerCase()} directed by ${movie.director}, rated ${movie.rating.toFixed(1)}/10.`,
    openGraph: movie.posterUrl ? { images: [movie.posterUrl] } : null,
  };
}

export default async function MoviePage({ params, searchParams }: PageProps<"/movies/[id]">) {
  const movie = await loadMovie((await params).id);
  const path = `/movies/${movie.id}`;

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
            href="/movies"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← All movies
          </Link>

          <div className="mt-8 grid gap-8 sm:grid-cols-[220px_1fr] md:grid-cols-[260px_1fr] md:gap-12">
            <div className="relative aspect-2/3 w-48 overflow-hidden rounded-2xl shadow-2xl shadow-black ring-1 ring-white/10 sm:w-full">
              <Poster movie={movie} sizes="260px" eager />
            </div>

            <div className="self-end" dir="auto">
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
                {movie.type}
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                {movie.title}
                {movie.releaseYear && (
                  <span dir="ltr" className="mx-3 inline-block text-2xl font-normal text-zinc-400 sm:text-3xl">
                    ({movie.releaseYear})
                  </span>
                )}
              </h1>

              {movie.description && (
                <p dir="auto" className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-300">
                  {movie.description}
                </p>
              )}

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
                {movie.runtime && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Length
                    </p>
                    <p dir="ltr" className="font-medium">{formatRuntime(movie.runtime)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Cast
                  </p>
                  <p className="font-medium">
                    {movie.actors.length}{" "}
                    {movie.actors.length === 1 ? "actor" : "actors"}
                  </p>
                </div>
                <Suspense fallback={null}>
                  <MembersRating kind="movie" id={movie.id} />
                </Suspense>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {movie.streamUrl ? (
                  <a href="#watch" className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300">
                    ▶ Watch now <span className="font-normal">· free</span>
                  </a>
                ) : movie.trailerYoutubeId ? (
                  <a href="#trailer" className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300">
                    ▶ Trailer
                  </a>
                ) : null}
                <Suspense fallback={<WatchlistButtonSkeleton />}>
                  <WatchlistButton kind="movie" id={movie.id} path={path} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The whole film, for films that are free to share */}
      {movie.streamUrl && (
        <section id="watch" className="mx-auto max-w-5xl scroll-mt-20 px-6 pt-12">
          <h2 className="mb-2 text-2xl font-semibold">
            Watch the full film
            {movie.runtime && (
              <span className="ml-3 text-base font-normal text-zinc-400">{formatRuntime(movie.runtime)}</span>
            )}
          </h2>
          <p className="mb-5 text-sm text-zinc-400">
            Free to watch: an open film shared under a Creative Commons license. Pick a quality from
            144p to 1080p, or leave it on Auto.
          </p>
          {/* Each film folder has a wide still next to its playlist: .../master.m3u8 -> .../thumbnail.jpg */}
          <VideoPlayer
            src={movie.streamUrl}
            poster={movie.streamUrl.replace(/master\.m3u8$/, "thumbnail.jpg")}
            title={movie.title}
          />
        </section>
      )}

      {movie.trailerYoutubeId && (
        <section id="trailer" className="mx-auto max-w-5xl scroll-mt-20 px-6 pt-12">
          <h2 className="mb-5 text-2xl font-semibold">Trailer</h2>
          <Trailer youtubeId={movie.trailerYoutubeId} title={movie.title} />
        </section>
      )}

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

      <ReviewsSection kind="movie" id={movie.id} path={path} searchParams={searchParams} />
    </>
  );
}
