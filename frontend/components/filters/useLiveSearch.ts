"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

// How long to wait after the last key before searching: fast enough to feel instant,
// slow enough not to send a request for every letter
const TYPING_DELAY_MS = 250;

// Values that are the default anyway stay out of the URL (/movies, not /movies?sort=title)
const DEFAULTS: Record<string, string> = { sort: "title" };

// Live search: reads the form and updates the URL (?search=inc&type=Drama).
// The page reads the URL on the server and sends back the new list.
export function useLiveSearch(path: string) {
  const router = useRouter();
  // isPending stays true until the new list has arrived: used for the "searching" hint.
  // Inside a transition React keeps the old list on screen meanwhile (no flicker).
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Leaving the page cancels a search that hasn't started yet
  useEffect(() => () => clearTimeout(timer.current), []);

  function apply(form: HTMLFormElement | null, { wait = false } = {}) {
    if (!form) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => {
        const params = new URLSearchParams();
        for (const [key, value] of new FormData(form)) {
          const text = String(value).trim();
          if (text && DEFAULTS[key] !== text) params.set(key, text);
        }
        const query = params.toString();
        // replace, not push: typing a word shouldn't fill the Back button with every letter
        startTransition(() => {
          router.replace(query ? `${path}?${query}` : path, { scroll: false });
        });
      },
      wait ? TYPING_DELAY_MS : 0,
    );
  }

  return { apply, isPending };
}
