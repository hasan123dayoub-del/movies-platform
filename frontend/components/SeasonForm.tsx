"use client"; // useActionState and the live poster preview run in the browser

import { useActionState } from "react";
import type { FormState, Season } from "@/lib/types";
import { Field, FormActions, inputClass } from "@/components/form/Field";
import { ImagePreview, useImagePreview } from "@/components/form/ImagePreview";

type SeasonFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  season: Season;
  cancelHref: string;
};

// Edit one season's details (its episodes are managed below it)
export default function SeasonForm({ action, season, cancelHref }: SeasonFormProps) {
  const initialState: FormState = {
    errors: {},
    values: {
      number: String(season.number),
      title: season.title ?? "",
      releaseYear: season.releaseYear ? String(season.releaseYear) : "",
      description: season.description ?? "",
      posterUrl: season.posterUrl ?? "",
    },
  };
  const [state, formAction, pending] = useActionState(action, initialState);
  const { errors, values } = state;
  const poster = useImagePreview(values.posterUrl ?? "");

  return (
    <form action={formAction} className="grid gap-8 md:grid-cols-[1fr_180px]" noValidate>
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-[110px_1fr_130px]">
          <Field label="Number" error={errors.number}>
            <input
              name="number"
              type="number"
              min="1"
              defaultValue={values.number}
              aria-invalid={Boolean(errors.number)}
              className={inputClass}
            />
          </Field>
          <Field label="Title (optional)" error={errors.title}>
            <input
              name="title"
              defaultValue={values.title}
              aria-invalid={Boolean(errors.title)}
              className={inputClass}
            />
          </Field>
          <Field label="Year (optional)" error={errors.releaseYear}>
            <input
              name="releaseYear"
              type="number"
              inputMode="numeric"
              defaultValue={values.releaseYear}
              aria-invalid={Boolean(errors.releaseYear)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Description (optional)" error={errors.description}>
          <textarea
            name="description"
            rows={3}
            maxLength={1000}
            defaultValue={values.description}
            aria-invalid={Boolean(errors.description)}
            className={`${inputClass} resize-y`}
          />
        </Field>

        <Field label="Poster URL (optional, the series poster is used otherwise)" error={errors.posterUrl}>
          <input
            name="posterUrl"
            type="url"
            defaultValue={values.posterUrl}
            aria-invalid={Boolean(errors.posterUrl)}
            className={inputClass}
            onChange={poster.onChange}
          />
        </Field>

        {errors.form && (
          <p role="alert" className="text-sm text-red-400">
            {errors.form}
          </p>
        )}

        <FormActions pending={pending} submitLabel="Save season" cancelHref={cancelHref} />
      </div>

      <ImagePreview preview={poster} alt="Season poster preview" emptyText="No season poster" />
    </form>
  );
}
