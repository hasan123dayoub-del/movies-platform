import Link from "next/link";
import type { Metadata } from "next";
import { getGenres } from "@/lib/api";
import MovieForm from "@/components/MovieForm";
import { createMovieAction } from "@/app/admin/movies/actions";

export const metadata: Metadata = { title: "Add a movie" };

export default async function NewMoviePage() {
  const genres = await getGenres();

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin/movies" className="text-sm text-zinc-400 transition hover:text-white">
        ← Back to movies
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Add a movie</h1>
      <p className="mt-2 mb-8 text-sm text-zinc-400">
        Step 1 of 2: the movie&apos;s details. After saving you&apos;ll add its cast.
      </p>

      <MovieForm action={createMovieAction} genres={genres} submitLabel="Save and add cast →" />
    </section>
  );
}
