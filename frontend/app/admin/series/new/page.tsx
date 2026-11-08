import Link from "next/link";
import type { Metadata } from "next";
import { getSeriesGenres } from "@/lib/api";
import SeriesForm from "@/components/SeriesForm";
import { createSeriesAction } from "@/app/admin/series/actions";

export const metadata: Metadata = { title: "Add a series" };

export default async function NewSeriesPage() {
  const genres = await getSeriesGenres();

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin/series" className="text-sm text-zinc-400 transition hover:text-white">
        ← Back to series
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Add a series</h1>
      <p className="mt-2 mb-8 text-sm text-zinc-400">
        Step 1 of 2: the series&apos; details. After saving you&apos;ll add its seasons, episodes
        and cast.
      </p>

      <SeriesForm action={createSeriesAction} genres={genres} submitLabel="Save and add seasons →" />
    </section>
  );
}
