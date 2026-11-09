import { cache } from "react";
import Link from "next/link";
import { getWatchlist } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { toggleWatchlistAction } from "@/app/(member)/actions";
import type { TitleKind } from "@/lib/types";
import WatchlistToggle from "./WatchlistToggle";

// Asked once per request, however many buttons a page has
const loadWatchlist = cache(getWatchlist);

type WatchlistButtonProps = { kind: TitleKind; id: number; path: string };

// "+ Watchlist" under a title. Logged-out visitors go to the login page first.
// It reads the cookie, so pages show it inside <Suspense>.
export default async function WatchlistButton(target: WatchlistButtonProps) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(target.path)}`}
        className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:text-white"
      >
        + Watchlist
      </Link>
    );
  }

  const list = await loadWatchlist();
  const saved = target.kind === "movie" ? list?.movies : list?.series;
  const inWatchlist = Boolean(saved?.some((item) => item.id === target.id));

  return (
    <WatchlistToggle action={toggleWatchlistAction.bind(null, target, inWatchlist)} inWatchlist={inWatchlist} />
  );
}

export function WatchlistButtonSkeleton() {
  return <div className="h-9 w-32 animate-pulse rounded-lg bg-zinc-800/60" />;
}
