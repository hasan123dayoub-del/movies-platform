import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSeries } from "@/lib/api";
import SeasonForm from "@/components/SeasonForm";
import EpisodesEditor from "@/components/EpisodesEditor";
import { updateSeasonAction } from "@/app/admin/series/actions";

export const metadata: Metadata = { title: "Edit season" };

// /admin/series/12/seasons/40: season 40 must belong to series 12, or it's a 404
export default async function EditSeasonPage({
  params,
}: PageProps<"/admin/series/[id]/seasons/[seasonId]">) {
  const { id, seasonId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(seasonId)) {
    notFound();
  }

  const series = await getSeries(Number(id));
  const season = series?.seasons.find((s) => s.id === Number(seasonId));
  if (!series || !season) {
    notFound();
  }
  const backHref = `/admin/series/${series.id}/edit#seasons`;

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Link href={backHref} className="text-sm text-zinc-400 transition hover:text-white">
        ← Back to {series.title}
      </Link>
      <h1 className="mt-4 mb-8 text-3xl font-bold">
        {series.title}: <span className="text-amber-400">Season {season.number}</span>
      </h1>

      <SeasonForm
        action={updateSeasonAction.bind(null, season.id, series.id)}
        season={season}
        cancelHref={backHref}
      />

      <EpisodesEditor seasonId={season.id} episodes={season.episodes} />
    </section>
  );
}
