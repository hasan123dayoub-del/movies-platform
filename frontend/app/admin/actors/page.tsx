import Link from "next/link";
import type { Metadata } from "next";
import { getActors } from "@/lib/api";
import { formatDate } from "@/lib/format";
import DeleteButton from "@/components/DeleteButton";
import { deleteActorAction } from "./actions";

export const metadata: Metadata = { title: "Actors" };

export default async function AdminActorsPage() {
  const actors = await getActors();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
            Admin
          </p>
          <h1 className="mt-1 text-3xl font-bold">Actors</h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-zinc-500">{actors.length} actors</p>
          <Link
            href="/admin/actors/new"
            className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
          >
            + Add actor
          </Link>
        </div>
      </div>

      {actors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-zinc-400">
          No actors yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Nationality</th>
                <th className="px-4 py-3">Born</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {actors.map((actor) => (
                <tr key={actor.id} className="hover:bg-zinc-900/60">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/actors/${actor.id}`}
                      className="transition hover:text-amber-400"
                    >
                      {actor.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{actor.nationality}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {formatDate(actor.birthday)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/actors/${actor.id}/edit`}
                        className="rounded-lg px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteActorAction.bind(null, actor.id)}
                        name={actor.name}
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
