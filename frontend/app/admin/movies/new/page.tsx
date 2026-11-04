import Link from "next/link";
import { getMovies } from "@/lib/api";
import MovieForm from "@/components/MovieForm";
import { createMovieAction } from "../../actions";

export default async function NewMoviePage() {
  // Only needed to suggest the genres that already exist
  const movies = await getMovies();
  const genres = [...new Set(movies.map((movie) => movie.type))].sort();

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin" className="text-sm text-zinc-400 transition hover:text-white">
        ← Back to movies
      </Link>
      <h1 className="mt-4 mb-8 text-3xl font-bold">Add a movie</h1>

      <MovieForm action={createMovieAction} genres={genres} submitLabel="Add movie" />
    </section>
  );
}
