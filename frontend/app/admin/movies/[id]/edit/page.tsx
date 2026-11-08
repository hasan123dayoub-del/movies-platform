import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMovie, getGenres, getActors } from "@/lib/api";
import MovieForm from "@/components/MovieForm";
import CastEditor from "@/components/CastEditor";
import { updateMovieAction } from "@/app/admin/movies/actions";
import { addCastAction, updateRoleAction, removeCastAction } from "@/app/admin/movies/cast-actions";

export const metadata: Metadata = { title: "Edit movie" };

export default async function EditMoviePage({
  params,
}: PageProps<"/admin/movies/[id]/edit">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    notFound();
  }

  // All three requests start together instead of one after the other
  const [movie, genres, actors] = await Promise.all([
    getMovie(Number(id)),
    getGenres(),
    getActors(),
  ]);
  if (!movie) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin/movies" className="text-sm text-zinc-400 transition hover:text-white">
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

      <CastEditor
        ownerId={movie.id}
        noun="movie"
        cast={movie.actors}
        actors={actors}
        actions={{ add: addCastAction, updateRole: updateRoleAction, remove: removeCastAction }}
      />
    </section>
  );
}
