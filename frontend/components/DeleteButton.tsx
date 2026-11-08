"use client"; // confirm() only exists in the browser

type DeleteButtonProps = {
  action: () => Promise<void>;
  name: string;
  // Optional wording, e.g. "Remove" for taking an actor out of a cast
  label?: string;
  question?: string;
};

export default function DeleteButton({
  action,
  name,
  label = "Delete",
  question = `Delete "${name}"? This can't be undone.`,
}: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(question)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        // Screen readers hear which row the button belongs to
        aria-label={`${label} ${name}`}
        className="rounded-lg px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10">
        {label}
      </button>
    </form>
  );
}
