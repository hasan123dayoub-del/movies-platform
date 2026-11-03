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
};
const defaultColors = "from-zinc-500 to-zinc-800";

type PosterProps = {
  movie: Pick<Movie, "title" | "type" | "posterUrl">;
  // Tells the browser how wide the image is shown, so it downloads the right size
  sizes: string;
  priority?: boolean;
};

// Fills its parent, so the parent decides the size (it must be `relative`)
export default function Poster({ movie, sizes, priority = false }: PosterProps) {
  if (movie.posterUrl) {
    return (
      <Image
        src={movie.posterUrl}
        alt={`${movie.title} poster`}
        fill
        sizes={sizes}
        priority={priority}
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
