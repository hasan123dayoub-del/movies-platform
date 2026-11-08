"use client"; // useActionState and the live photo preview run in the browser

import { useActionState } from "react";
import type { Actor, FormState } from "@/lib/types";
import { Field, FormActions, inputClass } from "@/components/form/Field";
import { ImagePreview, useImagePreview } from "@/components/form/ImagePreview";

type ActorFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  // The actor being edited; empty when adding a new one
  actor?: Actor;
  submitLabel: string;
};

export default function ActorForm({ action, actor, submitLabel }: ActorFormProps) {
  const initialState: FormState = {
    errors: {},
    values: {
      name: actor?.name ?? "",
      // The API sends "1952-06-07T00:00:00.000Z"; the date box wants "1952-06-07"
      birthday: actor ? actor.birthday.slice(0, 10) : "",
      nationality: actor?.nationality ?? "",
      photoUrl: actor?.photoUrl ?? "",
    },
  };
  const [state, formAction, pending] = useActionState(action, initialState);
  const { errors, values } = state;
  const photo = useImagePreview(values.photoUrl ?? "");

  return (
    <form action={formAction} className="grid gap-8 md:grid-cols-[1fr_220px]" noValidate>
      <div className="space-y-5">
        <Field label="Name" error={errors.name}>
          <input
            name="name"
            defaultValue={values.name}
            placeholder="Liam Neeson"
            aria-invalid={Boolean(errors.name)}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Birthday" error={errors.birthday}>
            <input
              name="birthday"
              type="date"
              defaultValue={values.birthday}
              aria-invalid={Boolean(errors.birthday)}
              className={`${inputClass} scheme-dark`}
            />
          </Field>

          <Field label="Nationality" error={errors.nationality}>
            <input
              name="nationality"
              defaultValue={values.nationality}
              placeholder="Northern Irish"
              aria-invalid={Boolean(errors.nationality)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Photo URL (optional)" error={errors.photoUrl}>
          <input
            name="photoUrl"
            type="url"
            defaultValue={values.photoUrl}
            placeholder="https://upload.wikimedia.org/....jpg"
            aria-invalid={Boolean(errors.photoUrl)}
            className={inputClass}
            onChange={photo.onChange}
          />
        </Field>

        <FormActions pending={pending} submitLabel={submitLabel} cancelHref="/admin/actors" />
      </div>

      <ImagePreview
        preview={photo}
        alt="Photo preview"
        emptyText="Paste a photo link to see it here"
      />
    </form>
  );
}
