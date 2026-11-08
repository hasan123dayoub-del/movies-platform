import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSeries } from "@/lib/api";
import type { Episode } from "@/lib/types";
import { formatDate, formatRuntime, plural } from "@/lib/format";
import Poster from "@/components/Poster";

// /series/12/seasons/2 -> the series and its season number 2 (404 if either is missing)
async function loadSeason(params: Promise<{ id: string; number: string }>) {
  const { id, number } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(number)) {
    notFound();
  }
  const series = await getSeries(Number(id));
  const season = series?.seasons.find((s) => s.number === Number(number));
  if (!series || !season) {
    notFound();
  }
  return { series, season };
}

export async function generateMetadata({
  params,
}: PageProps<"/series/[id]/seasons/[number]">): Promise<Metadata> {
  const { series, season } = await loadSeason(params);
  return {
    title: `${series.title}: Season ${season.number}`,
    description:
      season.description ??
      `Season ${season.number} of ${series.title}: ${plural(season.episodes.length, "episode")}.`,
  };
}

export default async function SeasonPage({ params }: PageProps<"/series/[id]/seasons/[number]">) {
  const { series, season } = await loadSeason(params);
  const index = series.seasons.findIndex((s) => s.id === season.id);
  const previous = series.seasons[index - 1];
  const next = series.seasons[index + 1];
  const totalMinutes = season.episodes.reduce((sum, e) => sum + (e.runtime ?? 0), 0);

  return (
    <>
      <section className="border-b border-white/10 bg-linear-to-b from-amber-400/10 to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <Link
            href={`/series/${series.id}`}
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← {series.title}
          </Link>

          <div className="mt-8 grid gap-8 sm:grid-cols-[180px_1fr] md:gap-10">
            <div className="relative aspect-2/3 w-40 overflow-hidden rounded-2xl shadow-2xl shadow-black ring-1 ring-white/10 sm:w-full">
              <Poster
                movie={{ ...series, posterUrl: season.posterUrl ?? series.posterUrl }}
                sizes="180px"
                eager
              />
            </div>
            <div className="self-end">
              {/* text-left: stays with "Season 1" below it, even when the name is Arabic */}
              <p className="text-left text-sm font-semibold uppercase tracking-widest text-amber-400">
                {series.title}
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                Season {season.number}
                {season.title && <span className="text-zinc-400">: {season.title}</span>}
              </h1>
              <p className="mt-3 text-zinc-400">
                {[
                  season.releaseYear,
                  plural(season.episodes.length, "episode"),
                  totalMinutes > 0 && formatRuntime(totalMinutes) + " in total",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {season.description && (
                <p dir="auto" className="mt-4 max-w-2xl leading-relaxed text-zinc-300">{season.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-semibold">Episodes</h2>
        {season.episodes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-zinc-400">
            No episodes have been added to this season yet.
          </div>
        ) : (
          <ol className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50">
            {season.episodes.map((episode) => (
              // dir="auto": an Arabic episode reads right to left, number on the right
              <li key={episode.id} dir="auto" className="flex gap-5 p-5">
                <span className="w-10 shrink-0 text-2xl font-bold text-zinc-600">
                  {episode.number}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{episode.title}</h3>
                  <EpisodeDetails episode={episode} />
                  {episode.description && (
                    <p dir="auto" className="mt-2 text-sm leading-relaxed text-zinc-300">
                      {episode.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        {/* Move between seasons without going back */}
        <nav className="mt-8 flex justify-between gap-4 text-sm">
          {previous ? (
            <Link
              href={`/series/${series.id}/seasons/${previous.number}`}
              className="rounded-lg border border-white/10 px-4 py-2.5 transition hover:border-white/20 hover:bg-white/5"
            >
              ← Season {previous.number}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/series/${series.id}/seasons/${next.number}`}
              className="rounded-lg border border-white/10 px-4 py-2.5 transition hover:border-white/20 hover:bg-white/5"
            >
              Season {next.number} →
            </Link>
          )}
        </nav>
      </section>
    </>
  );
}

// "January 20, 2008 · 58 min"; "Details coming soon" only when there is nothing at all
function EpisodeDetails({ episode }: { episode: Episode }) {
  const details = [
    episode.airDate && formatDate(episode.airDate),
    episode.runtime && formatRuntime(episode.runtime),
  ]
    .filter(Boolean)
    .join(" · ");
  if (!details && episode.description) return null;
  return (
    <p className="mt-0.5 text-sm text-zinc-500">
      {details || "Details coming soon"}
    </p>
  );
}
