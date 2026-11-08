import Image from "next/image";
import type { Movie } from "@/lib/types";
import { getInitials } from "@/lib/format";

// Used when a movie has no poster: each genre gets its own colors
const genreColors: Record<string, string> = {
  Romance: "from-rose-500 to-pink-900",
  "Sci-Fi": "from-cyan-500 to-indigo-900",
  Adventure: "from-emerald-500 to-teal-900",
  Comedy: "from-amber-400 to-orange-800",
  Drama: "from-violet-500 to-purple-900",
  Action: "from-red-500 to-red-900",
  Crime: "from-slate-500 to-slate-900",
  Thriller: "from-sky-700 to-slate-900",
  Musical: "from-fuchsia-500 to-indigo-900",
};
const defaultColors = "from-zinc-500 to-zinc-800";

type PosterProps = {
  movie: Pick<Movie, "title" | "type" | "posterUrl">;
  // Tells the browser how wide the image is shown, so it downloads the right size
  sizes: string;
  // For the big poster at the top of a page: load it right away, not lazily
  eager?: boolean;
};

// Fills its parent, so the parent decides the size (it must be `relative`)
export default function Poster({ movie, sizes, eager = false }: PosterProps) {
  if (movie.posterUrl) {
    return (
      <Image
        src={movie.posterUrl}
        alt={`${movie.title} poster`}
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="object-cover"
      />
    );
  }

  const colors = genreColors[movie.type] ?? defaultColors;
  return (
    <div
      className={`absolute inset-0 flex items-end bg-linear-to-br p-5 ${colors}`}
    >
      <span className="text-6xl font-black text-white/90 drop-shadow-lg">
        {getInitials(movie.title)}
      </span>
    </div>
  );
}
