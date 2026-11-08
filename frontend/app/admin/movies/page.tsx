import Link from "next/link";
import { getMovies } from "@/lib/api";
import DeleteButton from "@/components/DeleteButton";
import { deleteMovieAction } from "./actions";

export default async function AdminPage() {
  const movies = await getMovies();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
            Admin
          </p>
          <h1 className="mt-1 text-3xl font-bold">Movies</h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-zinc-500">{movies.length} movies</p>
          <Link
            href="/admin/movies/new"
            className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
          >
            + Add movie
          </Link>
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-zinc-400">
          No movies yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Director</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {movies.map((movie) => (
                <tr key={movie.id} className="hover:bg-zinc-900/60">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/movies/${movie.id}`}
                      className="transition hover:text-amber-400"
                    >
                      {movie.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{movie.type}</td>
                  <td className="px-4 py-3">
                    <span className="text-amber-400">★</span>{" "}
                    {movie.rating.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{movie.director}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/movies/${movie.id}/edit`}
                        className="rounded-lg px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteMovieAction.bind(null, movie.id)}
                        name={movie.title}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
