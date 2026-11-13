"use client"; // buttons that drive a video in the browser

import { useEffect, useState, type RefObject } from "react";

// Big buttons under a video, for TV remotes (arrows to pick one, OK to press it) and
// keyboards. A remote can't reach the small controls drawn inside a video, and none at
// all inside YouTube's player, so these drive the video from outside. They live in the
// same box as the video, so they stay on screen in full screen too.

type MediaControlsProps = {
  playing: boolean;
  muted: boolean;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onMute: () => void;
  // The box holding the video and these buttons: it is what goes full screen
  box: RefObject<HTMLElement | null>;
  // To put the remote's selection on Play/Pause right after the video starts
  playButton?: RefObject<HTMLButtonElement | null>;
};

// Whether that box is the one shown full screen right now
export function useFullscreen(box: RefObject<HTMLElement | null>) {
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === box.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, [box]);

  function toggle() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void box.current?.requestFullscreen();
    }
  }
  return { fullscreen, toggle };
}

const buttonClass =
  "flex min-h-11 items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:bg-amber-400 focus-visible:text-zinc-950";

export default function MediaControls({ playing, muted, onPlayPause, onSeek, onMute, box, playButton }: MediaControlsProps) {
  const { fullscreen, toggle } = useFullscreen(box);

  return (
    <div role="group" aria-label="Video controls" className="flex flex-wrap items-center justify-center gap-2 bg-zinc-950/90 p-3">
      <button type="button" onClick={() => onSeek(-10)} className={buttonClass} aria-label="Back 10 seconds">
        <span aria-hidden>⏪</span> 10s
      </button>
      <button ref={playButton} type="button" onClick={onPlayPause} className={`${buttonClass} min-w-28 justify-center`}>
        <span aria-hidden>{playing ? "⏸" : "▶"}</span> {playing ? "Pause" : "Play"}
      </button>
      <button type="button" onClick={() => onSeek(10)} className={buttonClass} aria-label="Forward 10 seconds">
        10s <span aria-hidden>⏩</span>
      </button>
      <button type="button" onClick={onMute} className={buttonClass}>
        <span aria-hidden>{muted ? "🔇" : "🔊"}</span> {muted ? "Unmute" : "Mute"}
      </button>
      <button type="button" onClick={toggle} className={buttonClass}>
        <span aria-hidden>⛶</span> {fullscreen ? "Exit full screen" : "Full screen"}
      </button>
    </div>
  );
}
