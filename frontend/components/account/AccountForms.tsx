"use client"; // useActionState keeps each form's errors in the browser

import { useActionState } from "react";
import { changePasswordAction, updateNameAction } from "@/app/(member)/account/actions";
import { emptyFormState } from "@/lib/form";
import { Field, inputClass, primaryButtonClass } from "@/components/form/Field";
import PasswordInput from "@/components/auth/PasswordInput";

// "Name saved" in green after a save, or the API's message for the whole form in red
function FormNote({ message, error }: { message: string | undefined; error: string | undefined }) {
  if (error) {
    return (
      <p role="alert" className="text-sm text-red-400">
        {error}
      </p>
    );
  }
  return message ? (
    <p role="status" className="text-sm text-emerald-400">
      ✓ {message}
    </p>
  ) : null;
}

export function NameForm({ name }: { name: string }) {
  const [state, formAction, pending] = useActionState(updateNameAction, emptyFormState);
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Name" error={state.errors.name}>
        <input
          name="name"
          defaultValue={state.values.name ?? name}
          maxLength={50}
          autoComplete="name"
          aria-invalid={Boolean(state.errors.name)}
          className={inputClass}
        />
      </Field>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : "Save name"}
        </button>
        <FormNote message={state.message} error={state.errors.form} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, emptyFormState);
  return (
    // A new key after a success empties the boxes
    <form key={state.message ?? "form"} action={formAction} className="space-y-4">
      <Field label="Current password" error={state.errors.currentPassword}>
        <PasswordInput name="currentPassword" autoComplete="current-password" invalid={Boolean(state.errors.currentPassword)} />
      </Field>
      <Field label="New password" error={state.errors.newPassword}>
        <PasswordInput
          name="newPassword"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          invalid={Boolean(state.errors.newPassword)}
        />
      </Field>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : "Change password"}
        </button>
        <FormNote message={state.message} error={state.errors.form} />
      </div>
    </form>
  );
}
