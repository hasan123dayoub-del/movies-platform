"use client";

import { inputClass } from "@/components/form/Field";

type SearchInputProps = {
  defaultValue: string | undefined;
  placeholder: string;
  label: string;
  isPending: boolean;
  onType: (input: HTMLInputElement) => void;
};

// The search box with a magnifier on the left and a spinner while results load
export default function SearchInput({ defaultValue, placeholder, label, isPending, onType }: SearchInputProps) {
  return (
    <div className="relative flex-1">
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-500"
      >
        ⌕
      </span>
      <input
        name="search"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
        // Fires on every key, and when the browser's ✕ clears the box
        onChange={(event) => onType(event.currentTarget)}
        className={`${inputClass} pr-10 pl-10`}
      />
      {isPending && (
        <span
          role="status"
          aria-label="Searching"
          className="absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-400"
        />
      )}
    </div>
  );
}
