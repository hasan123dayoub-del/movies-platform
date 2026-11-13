"use client"; // swaps the picture for the YouTube player on click

import { useEffect, useRef, useState } from "react";
import { showPlayer } from "@/lib/show-player";
import MediaControls from "./MediaControls";

type TrailerProps = {
  youtubeId: string;
  title: string;
};

const YOUTUBE = "https://www.youtube-nocookie.com";

// What YouTube's player reports about itself (its embed API, over postMessage)
type PlayerInfo = { playerState?: number; currentTime?: number; muted?: boolean };

// The official trailer from YouTube. It starts as a picture with a play button and only
// loads YouTube when pressed: the page stays fast (no player on every visit) and
// youtube-nocookie.com sets no cookies until the viewer chooses to watch.
// YouTube itself offers every quality from 144p to 1080p in its settings menu.
// Under it, big buttons drive the player, so a TV remote can pause it, skip, mute and
// go full screen: a remote can't reach the controls inside YouTube's frame.
export default function Trailer({ youtubeId, title }: TrailerProps) {
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const playButton = useRef<HTMLButtonElement>(null);
  const time = useRef(0);

  // Leaving the page puts the picture back, which removes YouTube's player and stops
  // the trailer (Next keeps the page we left hidden in memory, still playing otherwise)
  useEffect(() => () => setStarted(false), []);

  // Listen to the player: whether it plays, where it is, whether it is muted
  useEffect(() => {
    if (!started) return;
    function onMessage(event: MessageEvent) {
      if (event.origin !== YOUTUBE || event.source !== frame.current?.contentWindow) return;
      let data: { event?: string; info?: PlayerInfo };
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      const info = data.info;
      if (!info || typeof info !== "object") return;
      if (info.playerState !== undefined) setPlaying(info.playerState === 1 || info.playerState === 3);
      if (info.currentTime !== undefined) time.current = info.currentTime;
      if (info.muted !== undefined) setMuted(info.muted);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [started]);

  function send(message: object) {
    frame.current?.contentWindow?.postMessage(JSON.stringify({ ...message, id: 1, channel: "widget" }), YOUTUBE);
  }
  const command = (func: string, args: unknown[] = []) => send({ event: "command", func, args });

  function togglePlay() {
    command(playing ? "pauseVideo" : "playVideo");
    setPlaying(!playing);
  }

  function start() {
    setStarted(true);
    setPlaying(true);
    // The remote's selection goes to Play/Pause, ready to control the trailer, and the
    // whole player (picture and buttons) comes to the middle of the screen
    requestAnimationFrame(() => {
      playButton.current?.focus({ preventScroll: true });
      if (box.current) showPlayer(box.current);
    });
  }

  return (
    <div ref={box} className="media-box media-fit overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      {/* While it plays, the picture itself can be selected (Up from the buttons):
          OK on it plays or pauses, like on a TV app */}
      <div
        className="media-screen group/screen relative aspect-video focus-visible:outline-none"
        tabIndex={started ? 0 : undefined}
        aria-label={started ? `${title} trailer: OK plays or pauses` : undefined}
        onKeyDown={(event) => {
          if (started && event.key === "Enter" && event.target === event.currentTarget) {
            event.preventDefault();
            togglePlay();
          }
        }}
      >
        {started ? (
          <iframe
            ref={frame}
            src={`${YOUTUBE}/embed/${youtubeId}?autoplay=1&rel=0&enablejsapi=1&playsinline=1`}
            title={`${title} trailer`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            // Ask the player to report its state to this page
            onLoad={() => send({ event: "listening" })}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={start}
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
              <span className="grid h-16 w-16 place-items-center rounded-full bg-amber-400 text-2xl text-zinc-950 shadow-2xl shadow-black/60 transition group-hover:scale-110 group-focus-visible:scale-110">
                ▶
              </span>
            </span>
          </button>
        )}
        {started && <span aria-hidden className="pointer-events-none absolute inset-0 ring-4 ring-inset ring-amber-400 opacity-0 transition group-focus-visible/screen:opacity-100" />}
      </div>

      {started && (
        <MediaControls
          box={box}
          playButton={playButton}
          playing={playing}
          muted={muted}
          onPlayPause={togglePlay}
          onSeek={(seconds) => command("seekTo", [Math.max(0, time.current + seconds), true])}
          onMute={() => {
            command(muted ? "unMute" : "mute");
            setMuted(!muted);
          }}
        />
      )}
    </div>
  );
}
