"use client"; // useActionState and the live poster preview run in the browser

import { useActionState } from "react";
import type { FormState, Movie } from "@/lib/types";
import { Field, FormActions, inputClass } from "@/components/form/Field";
import { ImagePreview, useImagePreview } from "@/components/form/ImagePreview";

type MovieFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  // The movie being edited; empty when adding a new one
  movie?: Movie;
  // Existing genres, suggested while typing the type
  genres: string[];
  submitLabel: string;
};

export default function MovieForm({ action, movie, genres, submitLabel }: MovieFormProps) {
  const initialState: FormState = {
    errors: {},
    values: {
      title: movie?.title ?? "",
      type: movie?.type ?? "",
      rating: movie ? String(movie.rating) : "",
      director: movie?.director ?? "",
      releaseYear: movie?.releaseYear ? String(movie.releaseYear) : "",
      runtime: movie?.runtime ? String(movie.runtime) : "",
      description: movie?.description ?? "",
      posterUrl: movie?.posterUrl ?? "",
      trailer: movie?.trailerYoutubeId ? `https://www.youtube.com/watch?v=${movie.trailerYoutubeId}` : "",
      streamUrl: movie?.streamUrl ?? "",
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
            placeholder="Inception"
            aria-invalid={Boolean(errors.title)}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Type" error={errors.type}>
            <input
              name="type"
              defaultValue={values.type}
              placeholder="Sci-Fi"
              list="genres"
              aria-invalid={Boolean(errors.type)}
              className={inputClass}
            />
            <datalist id="genres">
              {genres.map((genre) => (
                <option key={genre} value={genre} />
              ))}
            </datalist>
          </Field>

          <Field label="Release year" error={errors.releaseYear}>
            <input
              name="releaseYear"
              type="number"
              step="1"
              min="1888"
              inputMode="numeric"
              defaultValue={values.releaseYear}
              placeholder="2010"
              aria-invalid={Boolean(errors.releaseYear)}
              className={inputClass}
            />
          </Field>

          <Field label="Minutes" error={errors.runtime}>
            <input
              name="runtime"
              type="number"
              step="1"
              min="1"
              max="600"
              inputMode="numeric"
              defaultValue={values.runtime}
              placeholder="148"
              aria-invalid={Boolean(errors.runtime)}
              className={inputClass}
            />
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
              aria-invalid={Boolean(errors.rating)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Director" error={errors.director}>
          <input
            name="director"
            defaultValue={values.director}
            placeholder="Christopher Nolan"
            aria-invalid={Boolean(errors.director)}
            className={inputClass}
          />
        </Field>

        <Field label="Description (optional)" error={errors.description}>
          <textarea
            name="description"
            rows={4}
            maxLength={1000}
            defaultValue={values.description}
            placeholder="What is the movie about? One or two sentences."
            aria-invalid={Boolean(errors.description)}
            className={`${inputClass} resize-y`}
          />
        </Field>

        <Field label="Poster URL (optional)" error={errors.posterUrl}>
          <input
            name="posterUrl"
            type="url"
            defaultValue={values.posterUrl}
            placeholder="https://image.tmdb.org/t/p/w500/....jpg"
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

        {/* Only for films that may be shared for free, e.g. Creative Commons */}
        <Field label="Stream link (optional, free films only)" error={errors.streamUrl}>
          <input
            name="streamUrl"
            type="url"
            defaultValue={values.streamUrl}
            placeholder="https://.../master.m3u8"
            aria-invalid={Boolean(errors.streamUrl)}
            className={inputClass}
          />
        </Field>

        <FormActions pending={pending} submitLabel={submitLabel} cancelHref="/admin/movies" />
      </div>

      <ImagePreview
        preview={poster}
        alt="Poster preview"
        emptyText="Paste a poster link to see it here"
      />
    </form>
  );
}
