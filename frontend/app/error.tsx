"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="text-5xl">🎬</p>
      <h1 className="mt-4 text-2xl font-semibold">Couldn&apos;t load the movies</h1>
      <p className="mt-2 text-zinc-400">
        The server didn&apos;t respond. Please try again in a moment.
      </p>
      <button
        onClick={() => retry()}
        className="mt-6 rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-zinc-950 transition hover:bg-amber-300"
      >
        Try again
      </button>
    </div>
  );
}
