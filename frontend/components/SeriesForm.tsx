"use client"; // useActionState and the live poster preview run in the browser

import { useActionState } from "react";
import type { FormState, Series } from "@/lib/types";
import { Field, FormActions, inputClass } from "@/components/form/Field";
import { ImagePreview, useImagePreview } from "@/components/form/ImagePreview";

type SeriesFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  // The series being edited; empty when adding a new one
  series?: Series;
  // Existing genres, suggested while typing the type
  genres: string[];
  submitLabel: string;
};

export default function SeriesForm({ action, series, genres, submitLabel }: SeriesFormProps) {
  const initialState: FormState = {
    errors: {},
    values: {
      title: series?.title ?? "",
      type: series?.type ?? "",
      rating: series ? String(series.rating) : "",
      creator: series?.creator ?? "",
      startYear: series ? String(series.startYear) : "",
      endYear: series?.endYear ? String(series.endYear) : "",
      description: series?.description ?? "",
      descriptionAr: series?.descriptionAr ?? "",
      posterUrl: series?.posterUrl ?? "",
      trailer: series?.trailerYoutubeId ? `https://www.youtube.com/watch?v=${series.trailerYoutubeId}` : "",
      tmdb: series?.tmdbId ? String(series.tmdbId) : "",
    },
  };
  const [state, formAction, pending] = useActionState(action, initialState);
  const { errors, values } = state;
  const poster = useImagePreview(values.posterUrl ?? "");

  return (
    <form action={formAction} className="grid gap-8 md:grid-cols-[1fr_220px]" noValidate>
      <div className="space-y-5">
        <Field label="Title" error={errors.title}>
          <input
            name="title"
            defaultValue={values.title}
            placeholder="Breaking Bad"
            aria-invalid={Boolean(errors.title)}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Type" error={errors.type}>
            <input
              name="type"
              defaultValue={values.type}
              placeholder="Crime"
              list="series-genres"
              aria-invalid={Boolean(errors.type)}
              className={inputClass}
            />
            <datalist id="series-genres">
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
              placeholder="9.5"
              aria-invalid={Boolean(errors.rating)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Created by" error={errors.creator}>
          <input
            name="creator"
            defaultValue={values.creator}
            placeholder="Vince Gilligan"
            aria-invalid={Boolean(errors.creator)}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First year" error={errors.startYear}>
            <input
              name="startYear"
              type="number"
              step="1"
              inputMode="numeric"
              defaultValue={values.startYear}
              placeholder="2008"
              aria-invalid={Boolean(errors.startYear)}
              className={inputClass}
            />
          </Field>

          <Field label="Last year (empty if still running)" error={errors.endYear}>
            <input
              name="endYear"
              type="number"
              step="1"
              inputMode="numeric"
              defaultValue={values.endYear}
              placeholder="2013"
              aria-invalid={Boolean(errors.endYear)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Description (optional)" error={errors.description}>
          <textarea
            name="description"
            rows={4}
            maxLength={1000}
            defaultValue={values.description}
            placeholder="What is the series about? One or two sentences."
            aria-invalid={Boolean(errors.description)}
            className={`${inputClass} resize-y`}
          />
        </Field>

        <Field label="Description in Arabic (optional)" error={errors.descriptionAr}>
          <textarea
            name="descriptionAr"
            dir="rtl"
            lang="ar"
            rows={4}
            maxLength={1000}
            defaultValue={values.descriptionAr}
            placeholder="عمّ يدور هذا المسلسل؟ جملة أو جملتان."
            aria-invalid={Boolean(errors.descriptionAr)}
            className={`${inputClass} resize-y`}
          />
        </Field>

        <Field label="Poster URL (optional)" error={errors.posterUrl}>
          <input
            name="posterUrl"
            type="url"
            defaultValue={values.posterUrl}
            placeholder="https://upload.wikimedia.org/....jpg"
            aria-invalid={Boolean(errors.posterUrl)}
            className={inputClass}
            onChange={poster.onChange}
          />
        </Field>

        <Field label="Trailer (optional)" error={errors.trailerYoutubeId}>
          <input
            name="trailer"
            defaultValue={values.trailer}
            placeholder="A YouTube link, e.g. https://www.youtube.com/watch?v=..."
            aria-invalid={Boolean(errors.trailerYoutubeId)}
            className={inputClass}
          />
        </Field>

        <Field label="TMDB id or link (optional, for “Where to watch”)" error={errors.tmdbId}>
          <input
            name="tmdb"
            defaultValue={values.tmdb}
            placeholder="e.g. https://www.themoviedb.org/tv/1396"
            aria-invalid={Boolean(errors.tmdbId)}
            className={inputClass}
          />
        </Field>

        {/* Errors that belong to no single field */}
        {errors.form && (
          <p role="alert" className="text-sm text-red-400">
            {errors.form}
          </p>
        )}

        <FormActions pending={pending} submitLabel={submitLabel} cancelHref="/admin/series" />
      </div>

      <ImagePreview preview={poster} alt="Poster preview" emptyText="Paste a poster link to see it here" />
    </form>
  );
}
