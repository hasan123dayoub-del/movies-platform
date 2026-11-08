import Link from "next/link";

// Shared pieces for the admin forms (movie, actor, cast)

export const inputClass =
  "w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 outline-none transition placeholder:text-zinc-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 aria-invalid:border-red-400/60";

export const primaryButtonClass =
  "shrink-0 rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60";

type FieldProps = {
  label: string;
  error: string | undefined;
  children: React.ReactNode;
};

// A label with its input inside, and the API's error message under it
export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</span>
      {children}
      {error && (
        <span role="alert" className="mt-1.5 block text-sm text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}

type FormActionsProps = {
  pending: boolean;
  submitLabel: string;
  cancelHref: string;
};

// The submit button (disabled while saving) and a way back
export function FormActions({ pending, submitLabel, cancelHref }: FormActionsProps) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Saving..." : submitLabel}
      </button>
      <Link
        href={cancelHref}
        className="rounded-lg px-4 py-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
      >
        Cancel
      </Link>
    </div>
  );
}
