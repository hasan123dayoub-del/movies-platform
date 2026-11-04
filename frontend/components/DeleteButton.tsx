"use client"; // confirm() only exists in the browser

type DeleteButtonProps = {
  action: () => Promise<void>;
  name: string;
};

export default function DeleteButton({ action, name }: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <button className="rounded-lg px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10">
        Delete
      </button>
    </form>
  );
}
