"use client"; // the list follows what you type and pick, without a Search button

import { useRef } from "react";
import { MOVIE_SORTS, type MovieFilters as Filters } from "@/lib/types";
import { inputClass } from "@/components/form/Field";
import { useLiveSearch } from "./useLiveSearch";
import SearchInput from "./SearchInput";

type CatalogFiltersProps = {
  // The list page: "/movies" or "/series"
  path: "/movies" | "/series";
  // What the URL says now, so the boxes show the current choice
  filters: Filters;
  genres: string[];
};

// Search, type and sort for /movies and /series. Every change updates the URL
// (/movies?search=inc&sort=newest), so a filtered list can be bookmarked or shared.
export default function CatalogFilters({ path, filters, genres }: CatalogFiltersProps) {
  const noun = path === "/movies" ? "movies" : "series";
  const formRef = useRef<HTMLFormElement>(null);
  const { apply, isPending } = useLiveSearch(path);
  const isFiltered = Boolean(filters.search || filters.type || (filters.sort && filters.sort !== "title"));

  function clearAll() {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("search") as HTMLInputElement).value = "";
    (form.elements.namedItem("type") as HTMLSelectElement).value = "";
    (form.elements.namedItem("sort") as HTMLSelectElement).value = "title";
    apply(form);
  }

  return (
    // A normal GET form underneath: Enter (or no JavaScript at all) still works
    <form
      ref={formRef}
      action={path}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        apply(event.currentTarget);
      }}
      className="mb-8 grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/50 p-4 sm:grid-cols-[1fr_auto_auto_auto]"
    >
      <SearchInput
        defaultValue={filters.search}
        placeholder="Start typing a title..."
        label={`Search ${noun} by title`}
        isPending={isPending}
        onType={(input) => apply(input.form, { wait: true })}
      />

      <select
        name="type"
        defaultValue={filters.type ?? ""}
        onChange={(event) => apply(event.currentTarget.form)}
        aria-label="Filter by type"
        className={`${inputClass} scheme-dark sm:w-48`}
      >
        <option value="">All types</option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>

      <select
        name="sort"
        defaultValue={filters.sort ?? "title"}
        onChange={(event) => apply(event.currentTarget.form)}
        aria-label={`Sort ${noun}`}
        className={`${inputClass} scheme-dark sm:w-48`}
      >
        {Object.entries(MOVIE_SORTS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={clearAll}
        disabled={!isFiltered}
        className="rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:invisible"
      >
        Clear
      </button>
    </form>
  );
}
