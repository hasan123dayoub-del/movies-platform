import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSeries, getSeriesGenres, getActors } from "@/lib/api";
import SeriesForm from "@/components/SeriesForm";
import SeasonsEditor from "@/components/SeasonsEditor";
import CastEditor from "@/components/CastEditor";
import {
  updateSeriesAction,
  addSeriesCastAction,
  updateSeriesRoleAction,
  removeSeriesCastAction,
} from "@/app/admin/series/actions";

export const metadata: Metadata = { title: "Edit series" };

// One page for everything about a series: its details, its seasons and its cast
export default async function EditSeriesPage({ params }: PageProps<"/admin/series/[id]/edit">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const [series, genres, actors] = await Promise.all([
    getSeries(Number(id)),
    getSeriesGenres(),
    getActors(),
  ]);
  if (!series) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin/series" className="text-sm text-zinc-400 transition hover:text-white">
        ← Back to series
      </Link>
      <h1 className="mt-4 mb-8 text-3xl font-bold">
        Edit <span className="text-amber-400">{series.title}</span>
      </h1>

      <SeriesForm
        action={updateSeriesAction.bind(null, series.id)}
        series={series}
        genres={genres}
        submitLabel="Save changes"
      />

      <SeasonsEditor seriesId={series.id} seasons={series.seasons} />

      <CastEditor
        ownerId={series.id}
        noun="series"
        cast={series.actors}
        actors={actors}
        actions={{
          add: addSeriesCastAction,
          updateRole: updateSeriesRoleAction,
          remove: removeSeriesCastAction,
        }}
      />
    </section>
  );
}
