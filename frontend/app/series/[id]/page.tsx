import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSeries } from "@/lib/api";
import { formatYears, plural, bornAndDied } from "@/lib/format";
import Poster from "@/components/Poster";
import ActorAvatar from "@/components/ActorAvatar";
import ReviewsSection, { MembersRating } from "@/components/reviews/ReviewsSection";
import WatchlistButton, { WatchlistButtonSkeleton } from "@/components/reviews/WatchlistButton";
import Trailer from "@/components/video/Trailer";
import WhereToWatchSection from "@/components/where-to-watch/WhereToWatchSection";

// /series/abc -> 404 without calling the API
async function loadSeries(id: string) {
  if (!/^\d+$/.test(id)) {
    notFound();
  }
  const series = await getSeries(Number(id));
  if (!series) {
    notFound();
  }
  return series;
}

export async function generateMetadata({ params }: PageProps<"/series/[id]">): Promise<Metadata> {
  const series = await loadSeries((await params).id);
  return {
    title: series.title,
    description:
      series.description ??
      `${series.title} (${formatYears(series.startYear, series.endYear)}): a ${series.type.toLowerCase()} series created by ${series.creator}.`,
    openGraph: series.posterUrl ? { images: [series.posterUrl] } : null,
  };
}

export default async function SeriesDetailPage({ params, searchParams }: PageProps<"/series/[id]">) {
  const series = await loadSeries((await params).id);
  const path = `/series/${series.id}`;
  const episodeCount = series.seasons.reduce((sum, season) => sum + season.episodes.length, 0);
  const running = series.endYear === null;

  return (
    <>
      {/* Header with the blurred poster behind it */}
      <section className="relative overflow-hidden border-b border-white/10">
        {series.posterUrl && (
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-25 blur-2xl"
            style={{ backgroundImage: `url(${series.posterUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-zinc-950/30 to-zinc-950" />

        <div className="relative mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <Link href="/series" className="text-sm text-zinc-400 transition hover:text-white">
            ← All series
          </Link>

          <div className="mt-8 grid gap-8 sm:grid-cols-[220px_1fr] md:grid-cols-[260px_1fr] md:gap-12">
            <div className="relative aspect-2/3 w-48 overflow-hidden rounded-2xl shadow-2xl shadow-black ring-1 ring-white/10 sm:w-full">
              <Poster movie={series} sizes="260px" eager />
            </div>

            <div className="self-end" dir="auto">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  {series.type}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    running
                      ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                      : "border border-white/15 bg-white/5 text-zinc-400"
                  }`}
                >
                  {running ? "Ongoing" : "Ended"}
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                {series.title}
                <span dir="ltr" className="mx-3 inline-block text-2xl font-normal text-zinc-400 sm:text-3xl">
                  ({formatYears(series.startYear, series.endYear)})
                </span>
              </h1>

              {series.description && (
                <p dir="auto" className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-300">
                  {series.description}
                </p>
              )}

              <dl className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl text-amber-400">★</span>
                  <span className="text-3xl font-bold">{series.rating.toFixed(1)}</span>
                  <span className="text-zinc-500">/10</span>
                </div>
                <Stat label="Created by" value={series.creator} />
                <Stat label="Seasons" value={String(series.seasons.length)} />
                <Stat label="Episodes" value={String(episodeCount)} />
                <Suspense fallback={null}>
                  <div>
                    <MembersRating kind="series" id={series.id} />
                  </div>
                </Suspense>
              </dl>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {series.trailerYoutubeId && (
                  <a href="#trailer" className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300">
                    ▶ Trailer
                  </a>
                )}
                <Suspense fallback={<WatchlistButtonSkeleton />}>
                  <WatchlistButton kind="series" id={series.id} path={path} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {series.trailerYoutubeId && (
        <section id="trailer" className="mx-auto max-w-5xl scroll-mt-20 px-6 pt-12">
          <h2 className="mb-5 text-2xl font-semibold">Trailer</h2>
          <Trailer youtubeId={series.trailerYoutubeId} title={series.title} />
        </section>
      )}

      <WhereToWatchSection kind="series" id={series.id} searchParams={searchParams} />

      {/* Seasons */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-semibold">Seasons</h2>
        {series.seasons.length === 0 ? (
          <Empty>No seasons have been added yet.</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {series.seasons.map((season) => (
              <Link
                key={season.id}
                href={`/series/${series.id}/seasons/${season.number}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:border-amber-400 hover:border-white/20"
              >
                <div className="relative aspect-2/3 overflow-hidden">
                  <div className="absolute inset-0 transition duration-500 group-hover:scale-105">
                    {/* A season without its own poster shows the series' poster */}
                    <Poster
                      movie={{ ...series, posterUrl: season.posterUrl ?? series.posterUrl }}
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    />
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold transition group-hover:text-amber-400">
                    Season {season.number}
                  </p>
                  {season.title && <p className="truncate text-sm text-zinc-300">{season.title}</p>}
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {[season.releaseYear, plural(season.episodes.length, "episode")]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Cast */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-6 text-2xl font-semibold">Cast</h2>
        {series.actors.length === 0 ? (
          <Empty>No cast has been added to this series yet.</Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {series.actors.map(({ actor, role }) => (
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
                    {actor.nationality} · {bornAndDied(actor)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <ReviewsSection kind="series" id={series.id} path={path} searchParams={searchParams} />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-zinc-400">
      {children}
    </div>
  );
}
