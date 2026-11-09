"use client"; // Error boundaries must be Client Components

import { useEffect, useState } from "react";

// The free hosting plan puts the API to sleep when nobody visits, so the usual reason
// for an error here is that it is still waking up. Retry on our own a few times and
// say so, instead of leaving the visitor in front of a broken page.
const AUTO_RETRIES = 6;
const RETRY_SECONDS = 10;

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  const [attempt, setAttempt] = useState(0);
  const [seconds, setSeconds] = useState(RETRY_SECONDS);
  const waiting = attempt < AUTO_RETRIES;

  useEffect(() => {
    console.error(error);
  }, [error]);

  // Count down once a second; at zero, retry and start the next round
  useEffect(() => {
    if (!waiting) {
      return;
    }
    const timer = setTimeout(() => {
      if (seconds > 1) {
        setSeconds(seconds - 1);
        return;
      }
      setAttempt((n) => n + 1);
      setSeconds(RETRY_SECONDS);
      retry();
    }, 1000);
    return () => clearTimeout(timer);
  }, [seconds, waiting, retry]);

  return (
    <div role="alert" className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="text-5xl">🎬</p>
      {waiting ? (
        <>
          <h1 className="mt-4 text-2xl font-semibold">Waking up the server…</h1>
          <p className="mt-2 text-zinc-400">
            This demo runs on free hosting that sleeps when nobody visits. It usually
            takes under a minute. Trying again in {seconds}s.
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-zinc-400">
            We couldn&apos;t load this page. Please try again in a moment.
          </p>
        </>
      )}
      <button
        type="button"
        onClick={() => {
          setSeconds(RETRY_SECONDS);
          retry();
        }}
        className="mt-6 rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-zinc-950 transition hover:bg-amber-300"
      >
        Try again now
      </button>
    </div>
  );
}
