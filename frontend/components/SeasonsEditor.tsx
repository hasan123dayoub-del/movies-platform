"use client"; // useActionState keeps the add form's errors in the browser

import { useActionState } from "react";
import Link from "next/link";
import type { SeasonWithEpisodes } from "@/lib/types";
import { emptyFormState } from "@/lib/form";
import { plural } from "@/lib/format";
import { addSeasonAction, deleteSeasonAction } from "@/app/admin/series/actions";
import { Field, inputClass, primaryButtonClass } from "@/components/form/Field";
import DeleteButton from "@/components/DeleteButton";

type SeasonsEditorProps = {
  seriesId: number;
  seasons: SeasonWithEpisodes[];
};

// The seasons of a series: open one to edit it and its episodes, delete it, or add a new one
export default function SeasonsEditor({ seriesId, seasons }: SeasonsEditorProps) {
  // The next number is suggested in the add form (1 after nothing, 4 after 1-3)
  const nextNumber = seasons.reduce((max, season) => Math.max(max, season.number), 0) + 1;

  return (
    <section id="seasons" className="mt-14 scroll-mt-20 border-t border-white/10 pt-10">
      <h2 className="text-2xl font-semibold">Seasons</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Open a season to edit it and manage its episodes.
      </p>

      {seasons.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center text-zinc-400">
          No seasons yet. Add the first one below.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-zinc-900/50">
          {seasons.map((season) => (
            <li key={season.id} className="flex flex-wrap items-center gap-4 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-400/10 font-bold text-amber-400">
                {season.number}
              </span>
              <div className="min-w-40 flex-1">
                <p className="font-semibold">
                  Season {season.number}
                  {season.title && <span className="text-zinc-400">: {season.title}</span>}
                </p>
                <p className="text-sm text-zinc-500">
                  {[season.releaseYear, plural(season.episodes.length, "episode")]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <Link
                href={`/admin/series/${seriesId}/seasons/${season.id}`}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                Edit & episodes
              </Link>
              <DeleteButton
                action={deleteSeasonAction.bind(null, season.id)}
                name={`Season ${season.number}`}
                question={`Delete season ${season.number} and its ${plural(season.episodes.length, "episode")}? This can't be undone.`}
              />
            </li>
          ))}
        </ul>
      )}

      <AddSeasonForm seriesId={seriesId} nextNumber={nextNumber} />
    </section>
  );
}

function AddSeasonForm({ seriesId, nextNumber }: { seriesId: number; nextNumber: number }) {
  const [state, formAction, pending] = useActionState(
    addSeasonAction.bind(null, seriesId),
    emptyFormState,
  );
  const { errors, values } = state;

  return (
    <form
      action={formAction}
      noValidate
      className="mt-6 rounded-2xl border border-dashed border-white/15 p-5"
    >
      <p className="font-medium">Add a season</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[110px_1fr_130px_auto]">
        <Field label="Number" error={errors.number}>
          <input
            // A new key after each added season, so the suggested number moves on
            key={nextNumber}
            name="number"
            type="number"
            min="1"
            defaultValue={values.number ?? String(nextNumber)}
            aria-invalid={Boolean(errors.number)}
            className={inputClass}
          />
        </Field>
        <Field label="Title (optional)" error={errors.title}>
          <input
            name="title"
            defaultValue={values.title ?? ""}
            placeholder="e.g. Al Awda"
            aria-invalid={Boolean(errors.title)}
            className={inputClass}
          />
        </Field>
        <Field label="Year (optional)" error={errors.releaseYear}>
          <input
            name="releaseYear"
            type="number"
            inputMode="numeric"
            defaultValue={values.releaseYear ?? ""}
            placeholder="2009"
            aria-invalid={Boolean(errors.releaseYear)}
            className={inputClass}
          />
        </Field>
        <button type="submit" disabled={pending} className={`${primaryButtonClass} self-start sm:mt-7`}>
          {pending ? "Adding..." : "Add"}
        </button>
      </div>
      {/* e.g. "Season 2 already exists in this series" */}
      {errors.form && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {errors.form}
        </p>
      )}
    </form>
  );
}
