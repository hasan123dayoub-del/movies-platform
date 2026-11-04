"use client"; // useActionState and the live poster preview run in the browser

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/lib/types";
import type { MovieFormState } from "@/app/admin/actions";

type MovieFormProps = {
  action: (state: MovieFormState, formData: FormData) => Promise<MovieFormState>;
  // The movie being edited; empty when adding a new one
  movie?: Movie;
  // Existing genres, suggested while typing the type
  genres: string[];
  submitLabel: string;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 outline-none transition placeholder:text-zinc-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";

function isImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function MovieForm({
  action,
  movie,
  genres,
  submitLabel,
}: MovieFormProps) {
  const initialState: MovieFormState = {
    errors: {},
    values: {
      title: movie?.title ?? "",
      type: movie?.type ?? "",
      rating: movie ? String(movie.rating) : "",
      director: movie?.director ?? "",
      posterUrl: movie?.posterUrl ?? "",
    },
  };
  const [state, formAction, pending] = useActionState(action, initialState);
  const { errors, values } = state;

  // Follows the poster box so the preview updates while typing
  const [posterUrl, setPosterUrl] = useState(values.posterUrl);
  const [posterFailed, setPosterFailed] = useState(false);
  const showPreview = isImageUrl(posterUrl) && !posterFailed;

  return (
    <form
      action={formAction}
      className="grid gap-8 md:grid-cols-[1fr_220px]"
      noValidate
    >
      <div className="space-y-5">
        <Field label="Title" error={errors.title}>
          <input
            name="title"
            defaultValue={values.title}
            placeholder="Inception"
            className={inputClass}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Type" error={errors.type}>
            <input
              name="type"
              defaultValue={values.type}
              placeholder="Sci-Fi"
              list="genres"
              className={inputClass}
            />
            <datalist id="genres">
              {genres.map((genre) => (
                <option key={genre} value={genre} />
              ))}
            </datalist>
          </Field>

          <Field label="Rating (0 – 10)" error={errors.rating}>
            <input
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="10"
              defaultValue={values.rating}
              placeholder="8.8"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Director" error={errors.director}>
          <input
            name="director"
            defaultValue={values.director}
            placeholder="Christopher Nolan"
            className={inputClass}
          />
        </Field>

        <Field label="Poster URL (optional)" error={errors.posterUrl}>
          <input
            name="posterUrl"
            defaultValue={values.posterUrl}
            placeholder="https://image.tmdb.org/t/p/w500/....jpg"
            className={inputClass}
            onChange={(e) => {
              setPosterUrl(e.target.value.trim());
              setPosterFailed(false);
            }}
          />
        </Field>

        <div className="flex items-center gap-3 pt-2">
          <button
            disabled={pending}
            className="rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Saving..." : submitLabel}
          </button>
          <Link
            href="/admin"
            className="rounded-lg px-4 py-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* Live poster preview */}
      <div>
        <p className="text-sm font-medium text-zinc-300">Preview</p>
        <div className="relative mt-1.5 aspect-2/3 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          {showPreview ? (
            <Image
              key={posterUrl}
              src={posterUrl}
              alt="Poster preview"
              fill
              unoptimized
              className="object-cover"
              onError={() => setPosterFailed(true)}
            />
          ) : (
            <p className="grid h-full place-items-center p-6 text-center text-sm text-zinc-500">
              {posterFailed
                ? "Couldn't load an image from this link"
                : "Paste a poster link to see it here"}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-sm text-red-400">{error}</span>}
    </label>
  );
}
