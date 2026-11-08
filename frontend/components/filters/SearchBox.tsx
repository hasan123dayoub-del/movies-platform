"use client"; // the list follows what you type

import { useLiveSearch } from "./useLiveSearch";
import SearchInput from "./SearchInput";

type SearchBoxProps = {
  // The page the search runs on, e.g. "/actors"
  action: string;
  value: string | undefined;
  placeholder: string;
  label: string;
};

// A one-box live search: /actors?search=leo
export default function SearchBox({ action, value, placeholder, label }: SearchBoxProps) {
  const { apply, isPending } = useLiveSearch(action);

  return (
    // A normal GET form underneath: Enter (or no JavaScript at all) still works
    <form
      action={action}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        apply(event.currentTarget);
      }}
      className="mb-8 flex gap-2 rounded-2xl border border-white/10 bg-zinc-900/50 p-4"
    >
      <SearchInput
        defaultValue={value}
        placeholder={placeholder}
        label={label}
        isPending={isPending}
        onType={(input) => apply(input.form, { wait: true })}
      />
    </form>
  );
}
