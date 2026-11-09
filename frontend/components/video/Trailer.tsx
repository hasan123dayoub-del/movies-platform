"use client"; // swaps the picture for the YouTube player on click

import { useEffect, useState } from "react";

type TrailerProps = {
  youtubeId: string;
  title: string;
};

// The official trailer from YouTube. It starts as a picture with a play button and only
// loads YouTube when pressed: the page stays fast (no player on every visit) and
// youtube-nocookie.com sets no cookies until the viewer chooses to watch.
// YouTube itself offers every quality from 144p to 1080p in its settings menu.
export default function Trailer({ youtubeId, title }: TrailerProps) {
  const [playing, setPlaying] = useState(false);

  // Leaving the page puts the picture back, which removes YouTube's player and stops
  // the trailer (Next keeps the page we left hidden in memory, still playing otherwise)
  useEffect(() => () => setPlaying(false), []);

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={`${title} trailer`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play the ${title} trailer`}
          className="group absolute inset-0 h-full w-full"
        >
          {/* YouTube's own still for the video */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
          />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-amber-400 text-2xl text-zinc-950 shadow-2xl shadow-black/60 transition group-hover:scale-110">
              ▶
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
