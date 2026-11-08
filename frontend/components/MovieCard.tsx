import Link from "next/link";
import type { Movie } from "@/lib/types";
import Poster from "./Poster";

type MovieCardProps = {
  movie: Movie;
  // Optional line under the title, e.g. the role on an actor's page
  subtitle?: string;
};

export default function MovieCard({ movie, subtitle }: MovieCardProps) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/60"
    >
      <div className="relative aspect-2/3 overflow-hidden">
        <div className="absolute inset-0 transition duration-500 group-hover:scale-105">
          <Poster
            movie={movie}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-sm font-semibold backdrop-blur">
          <span className="text-amber-400">★</span> {movie.rating.toFixed(1)}
        </span>
      </div>

      {/* dir="auto": an Arabic movie lays out right to left, an English one left to right */}
      <div className="p-4" dir="auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          {movie.type}
          {movie.releaseYear && <span className="text-zinc-500"> · {movie.releaseYear}</span>}
        </span>
        <h3 className="mt-1 font-semibold leading-snug transition group-hover:text-amber-400">
          {movie.title}
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          {subtitle ?? movie.director}
        </p>
      </div>
    </Link>
  );
}
