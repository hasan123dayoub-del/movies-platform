import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovie, getMovies } from "@/lib/api";
import MovieForm from "@/components/MovieForm";
import { updateMovieAction } from "../../../actions";

export default async function EditMoviePage({
  params,
}: PageProps<"/admin/movies/[id]/edit">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    notFound();
  }

  // Both requests start together instead of one after the other
  const [movie, movies] = await Promise.all([getMovie(Number(id)), getMovies()]);
  if (!movie) {
    notFound();
  }
  const genres = [...new Set(movies.map((m) => m.type))].sort();

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin" className="text-sm text-zinc-400 transition hover:text-white">
        ← Back to movies
      </Link>
      <h1 className="mt-4 mb-8 text-3xl font-bold">
        Edit <span className="text-amber-400">{movie.title}</span>
      </h1>

      <MovieForm
        action={updateMovieAction.bind(null, movie.id)}
        movie={movie}
        genres={genres}
        submitLabel="Save changes"
      />
    </section>
  );
}
