"use client"; // buttons that drive a video in the browser

import { useEffect, useRef, useState, type RefObject } from "react";

// Big buttons for a video, for TV remotes (arrows to pick one, OK to press it) and
// keyboards. A remote can't reach the small controls drawn inside a video, and none at
// all inside YouTube's player, so these drive the video from outside.
// On the page they sit under the video. In full screen they float over the bottom of
// the picture and fade away after a few seconds while it plays, like YouTube or
// Netflix; the next key press only brings them back (it doesn't also pause or skip).

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

const HIDE_AFTER_MS = 3000;
// The remote's Back key must still leave full screen while the buttons are hidden
const BACK_KEYS = new Set(["Escape", "GoBack", "BrowserBack", "XF86Back"]);

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
  "flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-white/20 focus-visible:bg-amber-400 focus-visible:text-zinc-950";

export default function MediaControls({ playing, muted, onPlayPause, onSeek, onMute, box, playButton }: MediaControlsProps) {
  const { fullscreen, toggle } = useFullscreen(box);
  const [awake, setAwake] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Hidden only in full screen, while playing, after a few quiet seconds
  const hidden = fullscreen && playing && !awake;

  // Any key, mouse move or touch shows the buttons again and restarts the countdown
  useEffect(() => {
    if (!fullscreen) return;
    function wake() {
      setAwake(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setAwake(false), HIDE_AFTER_MS);
    }
    wake();
    document.addEventListener("mousemove", wake);
    document.addEventListener("pointerdown", wake);
    document.addEventListener("keydown", wake);
    return () => {
      document.removeEventListener("mousemove", wake);
      document.removeEventListener("pointerdown", wake);
      document.removeEventListener("keydown", wake);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [fullscreen]);

  // While they are hidden, the first key press only brings them back: it must not also
  // pause the film or move the selection to a button the viewer can't see yet.
  // Listening first (capture), before the arrows' navigation and the buttons get it.
  useEffect(() => {
    if (!hidden) return;
    function swallow(event: KeyboardEvent) {
      if (BACK_KEYS.has(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      setAwake(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setAwake(false), HIDE_AFTER_MS);
    }
    window.addEventListener("keydown", swallow, { capture: true });
    return () => window.removeEventListener("keydown", swallow, { capture: true });
  }, [hidden]);

  const place = fullscreen
    ? // over the bottom of the picture, on a dark fade so the buttons stay readable
      "absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/90 via-black/60 to-transparent pb-6 pt-16"
    : "bg-zinc-950/90";

  return (
    <div
      role="group"
      aria-label="Video controls"
      className={`${place} flex flex-wrap items-center justify-center gap-1.5 p-2.5 transition-opacity duration-300 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <button type="button" onClick={() => onSeek(-10)} className={buttonClass} aria-label="Back 10 seconds">
        <span aria-hidden>⏪</span> 10s
      </button>
      <button ref={playButton} type="button" onClick={onPlayPause} className={`${buttonClass} min-w-24 justify-center`}>
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
