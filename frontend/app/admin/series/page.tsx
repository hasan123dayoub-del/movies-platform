import Link from "next/link";
import type { Metadata } from "next";
import { getSeriesList } from "@/lib/api";
import { formatYears } from "@/lib/format";
import DeleteButton from "@/components/DeleteButton";
import { deleteSeriesAction } from "./actions";

export const metadata: Metadata = { title: "Series" };

export default async function AdminSeriesPage() {
  const list = await getSeriesList();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Admin</p>
          <h1 className="mt-1 text-3xl font-bold">Series</h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-zinc-500">{list.length} series</p>
          <Link
            href="/admin/series/new"
            className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
          >
            + Add series
          </Link>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-zinc-400">
          No series yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Years</th>
                <th className="px-4 py-3">Seasons</th>
                <th className="px-4 py-3">Episodes</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {list.map((series) => (
                <tr key={series.id} className="hover:bg-zinc-900/60">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/series/${series.id}`} className="transition hover:text-amber-400">
                      {series.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{series.type}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {formatYears(series.startYear, series.endYear)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{series.seasonCount}</td>
                  <td className="px-4 py-3 text-zinc-400">{series.episodeCount}</td>
                  <td className="px-4 py-3">
                    <span className="text-amber-400">★</span> {series.rating.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/series/${series.id}/edit`}
                        className="rounded-lg px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteSeriesAction.bind(null, series.id)}
                        name={series.title}
                        question={`Delete "${series.title}" with all its seasons and episodes? This can't be undone.`}
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
