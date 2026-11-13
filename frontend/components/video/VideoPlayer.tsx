"use client"; // the player runs in the browser

import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import MediaControls from "./MediaControls";

type VideoPlayerProps = {
  // The HLS master playlist (.m3u8): it lists every quality, 144p to 1080p
  src: string;
  poster?: string | null | undefined;
  title: string;
};

type Quality = { index: number; height: number };

// Adaptive streaming (HLS), like YouTube or Netflix: the film is cut into 4-second
// pieces in six qualities. "Auto" picks the best quality the connection can keep up
// with and changes it while playing; the viewer can also pick one.
// Chrome, Edge and Firefox play HLS through hls.js; Safari (and iPhones) play it natively.
export default function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [qualities, setQualities] = useState<Quality[]>([]);
  // -1 = Auto
  const [chosen, setChosen] = useState(-1);
  const [playingHeight, setPlayingHeight] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [native, setNative] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;

    (async () => {
      // Loaded only on pages that have a player, so other pages stay light
      const { default: HlsLib } = await import("hls.js");
      if (cancelled) return;

      if (HlsLib.isSupported()) {
        const hls = new HlsLib({ capLevelToPlayerSize: false });
        hlsRef.current = hls;
        hls.on(HlsLib.Events.MANIFEST_PARSED, (_event, data) => {
          // Highest first, the way quality menus usually list them
          setQualities(
            data.levels.map((level, index) => ({ index, height: level.height })).sort((a, b) => b.height - a.height),
          );
        });
        hls.on(HlsLib.Events.LEVEL_SWITCHED, (_event, data) => {
          setPlayingHeight(hls.levels[data.level]?.height ?? null);
        });
        hls.on(HlsLib.Events.FRAG_LOADED, () => {
          // hls.js measures the download speed of every piece
          setSpeed(hls.bandwidthEstimate);
        });
        hls.on(HlsLib.Events.ERROR, (_event, data) => {
          if (data.fatal) setFailed(true);
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari: the browser itself switches quality (no menu needed)
        setNative(true);
        video.src = src;
      } else {
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src]);

  // Leaving the page stops the film. Next keeps the page we left hidden in memory
  // (so Back is instant), and without this the sound would go on playing there.
  useEffect(() => {
    const video = videoRef.current;
    return () => video?.pause();
  }, []);

  function choose(index: number) {
    setChosen(index);
    const hls = hlsRef.current;
    if (!hls) return;
    // currentLevel switches right away (Auto: -1 lets hls.js decide again)
    hls.currentLevel = index;
  }

  // The buttons under the film (for TV remotes) drive the same <video>
  function playPause() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }
  function seek(seconds: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + seconds), video.duration || Infinity);
  }
  function toggleMute() {
    const video = videoRef.current;
    if (video) video.muted = !video.muted;
  }

  return (
    // The player and its buttons always fit on the screen as a whole (see .media-fit)
    <div className="media-fit">
      <div ref={box} className="media-box relative overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          poster={poster ?? undefined}
          aria-label={`${title}: OK plays or pauses`}
          // The picture can be selected with the remote (Up from the buttons); OK on it plays or pauses
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              playPause();
            }
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
          className="media-screen peer aspect-video w-full bg-black focus-visible:outline-none"
        />
        {/* The ring that shows the picture is selected (an outline would be cut off) */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 aspect-video ring-4 ring-inset ring-amber-400 opacity-0 transition peer-focus-visible:opacity-100" />
        {failed && (
          <div role="alert" className="absolute inset-0 grid place-items-center bg-black/80 p-6 text-center">
            <p>
              This video can&apos;t be played right now.{" "}
              <button type="button" onClick={() => location.reload()} className="text-amber-400 hover:text-amber-300">
                Try again
              </button>
            </p>
          </div>
        )}
        <MediaControls
          box={box}
          playing={playing}
          muted={muted}
          onPlayPause={playPause}
          onSeek={seek}
          onMute={toggleMute}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-zinc-400" aria-live="polite">
          {playingHeight ? (
            <>
              Playing in <span className="font-semibold text-white">{playingHeight}p</span>
              {chosen === -1 && " (Auto)"}
              {speed ? <span className="text-zinc-500"> · your connection ≈ {(speed / 1_000_000).toFixed(1)} Mbps</span> : null}
            </>
          ) : native ? (
            "Quality adjusts to your connection automatically"
          ) : (
            "Press play: the quality adjusts to your connection"
          )}
        </p>

        {qualities.length > 0 && (
          <label className="flex items-center gap-2 text-zinc-400">
            Quality
            <select
              value={chosen}
              onChange={(event) => choose(Number(event.target.value))}
              className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-white scheme-dark focus:border-amber-400 focus:outline-none"
            >
              <option value={-1}>Auto</option>
              {qualities.map((quality) => (
                <option key={quality.index} value={quality.index}>
                  {quality.height}p{quality.height >= 720 ? " HD" : ""}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
