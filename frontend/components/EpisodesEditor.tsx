"use client"; // each row remembers whether it is being edited

import { useActionState, useState } from "react";
import type { Episode, FormState } from "@/lib/types";
import { formatDate, formatRuntime } from "@/lib/format";
import {
  addEpisodeAction,
  updateEpisodeAction,
  deleteEpisodeAction,
} from "@/app/admin/series/actions";
import { Field, inputClass, primaryButtonClass } from "@/components/form/Field";
import DeleteButton from "@/components/DeleteButton";

type EpisodesEditorProps = {
  seasonId: number;
  episodes: Episode[];
};

// The episodes of one season: edit one in place, delete it, or add the next one
export default function EpisodesEditor({ seasonId, episodes }: EpisodesEditorProps) {
  const nextNumber = episodes.reduce((max, episode) => Math.max(max, episode.number), 0) + 1;

  return (
    <section id="episodes" className="mt-14 scroll-mt-20 border-t border-white/10 pt-10">
      <h2 className="text-2xl font-semibold">Episodes</h2>

      {episodes.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center text-zinc-400">
          No episodes yet. Add the first one below.
        </div>
      ) : (
        <ol className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-zinc-900/50">
          {episodes.map((episode) => (
            <EpisodeRow key={episode.id} episode={episode} />
          ))}
        </ol>
      )}

      <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-5">
        <p className="font-medium">Add an episode</p>
        {/* A new key after each added episode, so the suggested number moves on */}
        <EpisodeFields
          key={nextNumber}
          action={addEpisodeAction.bind(null, seasonId)}
          defaults={{ number: String(nextNumber) }}
          submitLabel="Add"
        />
      </div>
    </section>
  );
}

function EpisodeRow({ episode }: { episode: Episode }) {
  const [editing, setEditing] = useState(false);
  const details = [
    episode.airDate && formatDate(episode.airDate),
    episode.runtime && formatRuntime(episode.runtime),
  ]
    .filter(Boolean)
    .join(" · ");

  if (editing) {
    return (
      <li className="p-4">
        <EpisodeFields
          action={updateEpisodeAction.bind(null, episode.id)}
          defaults={{
            number: String(episode.number),
            title: episode.title,
            airDate: episode.airDate?.slice(0, 10) ?? "",
            runtime: episode.runtime ? String(episode.runtime) : "",
            description: episode.description ?? "",
          }}
          submitLabel="Save"
          onSaved={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-start gap-4 p-4">
      <span className="w-8 shrink-0 text-xl font-bold text-zinc-600">{episode.number}</span>
      <div className="min-w-40 flex-1">
        <p className="font-semibold">{episode.title}</p>
        {details && <p className="text-sm text-zinc-500">{details}</p>}
        {episode.description && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{episode.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
      >
        Edit
      </button>
      <DeleteButton
        action={deleteEpisodeAction.bind(null, episode.id)}
        name={`Episode ${episode.number}: ${episode.title}`}
      />
    </li>
  );
}

type EpisodeFieldsProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaults: Record<string, string>;
  submitLabel: string;
  onSaved?: () => void;
  onCancel?: () => void;
};

// The fields of one episode, used both to add and to edit
function EpisodeFields({ action, defaults, submitLabel, onSaved, onCancel }: EpisodeFieldsProps) {
  const [state, formAction, pending] = useActionState(
    async (previous: FormState, formData: FormData) => {
      const next = await action(previous, formData);
      // The edit action answers { saved: "1" } when it worked: close the row
      if (next.values.saved) onSaved?.();
      return next;
    },
    { errors: {}, values: defaults },
  );
  const { errors } = state;
  // After a failed save keep what was typed; after a successful add, start from the defaults
  const values = Object.keys(state.values).length > 0 && !state.values.saved ? state.values : defaults;

  return (
    <form action={formAction} noValidate className="mt-3 space-y-4">
      <div className="grid gap-4 sm:grid-cols-[90px_1fr_160px_120px]">
        <Field label="No." error={errors.number}>
          <input
            name="number"
            type="number"
            min="1"
            defaultValue={values.number}
            aria-invalid={Boolean(errors.number)}
            className={inputClass}
          />
        </Field>
        <Field label="Title" error={errors.title}>
          <input
            name="title"
            defaultValue={values.title ?? ""}
            placeholder="Pilot"
            aria-invalid={Boolean(errors.title)}
            className={inputClass}
          />
        </Field>
        <Field label="Air date" error={errors.airDate}>
          <input
            name="airDate"
            type="date"
            defaultValue={values.airDate ?? ""}
            aria-invalid={Boolean(errors.airDate)}
            className={`${inputClass} scheme-dark`}
          />
        </Field>
        <Field label="Minutes" error={errors.runtime}>
          <input
            name="runtime"
            type="number"
            min="1"
            defaultValue={values.runtime ?? ""}
            placeholder="47"
            aria-invalid={Boolean(errors.runtime)}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Plot (optional)" error={errors.description}>
        <textarea
          name="description"
          rows={2}
          maxLength={1000}
          defaultValue={values.description ?? ""}
          aria-invalid={Boolean(errors.description)}
          className={`${inputClass} resize-y`}
        />
      </Field>
      {errors.form && (
        <p role="alert" className="text-sm text-red-400">
          {errors.form}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
