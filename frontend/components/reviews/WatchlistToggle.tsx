"use client"; // shows "Saving..." while the action runs

import { useFormStatus } from "react-dom";

type WatchlistToggleProps = {
  // toggleWatchlistAction already bound to this title and its current state
  action: () => Promise<void>;
  inWatchlist: boolean;
};

export default function WatchlistToggle({ action, inWatchlist }: WatchlistToggleProps) {
  return (
    <form action={action}>
      <ToggleButton inWatchlist={inWatchlist} />
    </form>
  );
}

// useFormStatus must be inside the <form> it watches
function ToggleButton({ inWatchlist }: { inWatchlist: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-pressed={inWatchlist}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-wait disabled:opacity-60 ${
        inWatchlist
          ? "bg-amber-400/15 text-amber-400 ring-1 ring-amber-400/40 hover:bg-amber-400/25"
          : "border border-white/15 text-zinc-200 hover:border-white/30 hover:text-white"
      }`}
    >
      {pending ? "Saving..." : inWatchlist ? "✓ In your watchlist" : "+ Watchlist"}
    </button>
  );
}
