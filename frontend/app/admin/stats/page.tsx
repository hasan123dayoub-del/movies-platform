import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { AdminStats, TitleKind } from "@/lib/types";
import Poster from "@/components/Poster";

export const metadata: Metadata = { title: "Overview" };

const titleHref = (kind: TitleKind, id: number) => `/${kind === "movie" ? "movies" : "series"}/${id}`;

// /admin/stats: what is in the catalog and what members are doing.
// The admin layout already checked that the visitor is an admin.
export default async function AdminStatsPage() {
  const stats = await getAdminStats();
  if (!stats) {
    throw new Error("Failed to load the stats");
  }
  const { counts } = stats;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Admin</p>
      <h1 className="mt-2 mb-8 text-3xl font-bold tracking-tight">Overview</h1>

      {/* The numbers */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Tile label="Movies" value={counts.movies} href="/admin/movies" />
        <Tile
          label="Series"
          value={counts.series}
          note={`${counts.seasons} seasons · ${counts.episodes.toLocaleString("en-US")} episodes`}
          href="/admin/series"
        />
        <Tile label="Actors" value={counts.actors} href="/admin/actors" />
        <Tile label="Members" value={counts.members} note={`+ ${counts.admins} ${counts.admins === 1 ? "admin" : "admins"}`} />
        <Tile
          label="Reviews"
          value={counts.reviews}
          note={stats.averageReview === null ? "No ratings yet" : `Average ★ ${stats.averageReview.toFixed(1)}`}
        />
        <Tile label="Watchlist saves" value={counts.watchlistItems} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Panel title="Top rated by members" empty="No reviews yet.">
          {stats.topRated.map((title, i) => (
            <TitleRow key={`${title.kind}-${title.id}`} rank={i + 1} title={title}>
              <span className="font-semibold text-amber-400">★ {title.average.toFixed(1)}</span>
              <span className="text-xs text-zinc-500">
                {title.reviews} {title.reviews === 1 ? "review" : "reviews"}
              </span>
            </TitleRow>
          ))}
        </Panel>

        <Panel title="Most saved to watchlists" empty="Nobody has saved anything yet.">
          {stats.mostSaved.map((title, i) => (
            <TitleRow key={`${title.kind}-${title.id}`} rank={i + 1} title={title}>
              <span className="font-semibold">{title.saves}</span>
              <span className="text-xs text-zinc-500">{title.saves === 1 ? "member" : "members"}</span>
            </TitleRow>
          ))}
        </Panel>

        <Panel title="Latest reviews" empty="No reviews yet.">
          {stats.latestReviews.map((review) => (
            <li key={review.id} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm">
                  <span className="font-medium">{review.user.name}</span>
                  <span className="text-zinc-500"> on </span>
                  <Link href={titleHref(review.title.kind, review.title.id)} className="text-amber-400 hover:text-amber-300">
                    {review.title.title}
                  </Link>
                </p>
                <span className="shrink-0 text-sm font-semibold text-amber-400">★ {review.rating}/10</span>
              </div>
              {review.comment && (
                <p dir="auto" className="mt-1 line-clamp-2 text-sm text-zinc-400">
                  {review.comment}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-600">{formatDate(review.updatedAt)}</p>
            </li>
          ))}
        </Panel>

        <Panel title="Newest members" empty="No members yet.">
          {stats.newestMembers.map((member) => (
            <li key={member.id} className="flex items-center gap-3 px-5 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300">
                {member.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{member.name}</p>
                <p className="text-xs text-zinc-500">Joined {formatDate(member.createdAt)}</p>
              </div>
              <p className="shrink-0 text-right text-xs text-zinc-400">
                {member.reviews} {member.reviews === 1 ? "review" : "reviews"}
                <br />
                {member.saved} saved
              </p>
            </li>
          ))}
        </Panel>
      </div>
    </section>
  );
}

function Tile({ label, value, note, href }: { label: string; value: number; note?: string; href?: string }) {
  const body = (
    <>
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value.toLocaleString("en-US")}</p>
      {note && <p className="mt-1 text-xs text-zinc-400">{note}</p>}
    </>
  );
  const box = "block rounded-2xl border border-white/10 bg-zinc-900 p-5";
  return href ? (
    <Link href={href} className={`${box} transition hover:border-white/25`}>
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  );
}

function Panel({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
      <h2 className="border-b border-white/10 px-5 py-4 font-semibold">{title}</h2>
      {children.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-zinc-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-white/5">{children}</ul>
      )}
    </div>
  );
}

function TitleRow({
  rank,
  title,
  children,
}: {
  rank: number;
  title: AdminStats["topRated"][number] | AdminStats["mostSaved"][number];
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link href={titleHref(title.kind, title.id)} className="group flex items-center gap-4 px-5 py-3 transition hover:bg-white/5">
        <span className="w-4 text-sm text-zinc-600">{rank}</span>
        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-800">
          <Poster movie={{ title: title.title, type: "", posterUrl: title.posterUrl }} sizes="40px" />
        </div>
        <div className="min-w-0 flex-1">
          {/* Left-aligned even for Arabic titles, so they stay next to their poster */}
          <p dir="auto" className="truncate text-left font-medium transition group-hover:text-amber-400">
            {title.title}
          </p>
          <p className="text-xs text-zinc-500">{title.kind === "movie" ? "Movie" : "Series"}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end">{children}</div>
      </Link>
    </li>
  );
}
