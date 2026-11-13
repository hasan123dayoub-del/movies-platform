import Link from "next/link";
import type { Series } from "@/lib/types";
import { formatYears, plural } from "@/lib/format";
import Poster from "./Poster";
import MembersRatingLine from "./MembersRatingLine";

type SeriesCardProps = {
  series: Series & { seasonCount?: number };
  // Optional line under the title, e.g. the role on an actor's page
  subtitle?: string;
};

// Like MovieCard, with the years it ran and how many seasons it has
export default function SeriesCard({ series, subtitle }: SeriesCardProps) {
  const running = series.endYear === null;

  return (
    <Link
      href={`/series/${series.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:border-amber-400 hover:border-white/20 hover:shadow-2xl hover:shadow-black/60"
    >
      <div className="relative aspect-2/3 overflow-hidden">
        <div className="absolute inset-0 transition duration-500 group-hover:scale-105">
          <Poster
            movie={series}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-sm font-semibold backdrop-blur">
          <span className="text-amber-400">★</span> {series.rating.toFixed(1)}
        </span>
        {running && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-zinc-950">
            Ongoing
          </span>
        )}
      </div>

      {/* dir="auto": an Arabic series lays out right to left, an English one left to right */}
      <div className="p-4" dir="auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          {series.type}
          <span className="text-zinc-500">
            {" · "}
            {/* Years always read left to right, even inside Arabic text */}
            <span dir="ltr">{formatYears(series.startYear, series.endYear)}</span>
          </span>
        </span>
        <h3 className="mt-1 font-semibold leading-snug transition group-hover:text-amber-400">
          {series.title}
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          {subtitle ??
            (series.seasonCount !== undefined ? plural(series.seasonCount, "season") : series.creator)}
        </p>
        <MembersRatingLine membersRating={series.membersRating} reviewCount={series.reviewCount} />
      </div>
    </Link>
  );
}
