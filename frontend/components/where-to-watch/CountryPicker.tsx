"use client"; // changes the address and remembers the choice in the browser

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { COUNTRY_COOKIE } from "@/lib/watch-country";

type CountryPickerProps = {
  value: string;
  // [code, name] pairs, already sorted by name
  options: [string, string][];
};

// Picking a country reloads the offers for it (?country=SA) and remembers it for a year,
// so every other title opens on the same country
export default function CountryPicker({ value, options }: CountryPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function choose(code: string) {
    document.cookie = `${COUNTRY_COOKIE}=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => {
      router.replace(`${pathname}?country=${code}#where-to-watch`, { scroll: false });
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-400">
      Country
      <select
        value={value}
        onChange={(event) => choose(event.target.value)}
        disabled={pending}
        className="max-w-56 rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-white scheme-dark focus:border-amber-400 focus:outline-none disabled:opacity-60"
      >
        {options.map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
