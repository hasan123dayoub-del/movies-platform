import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { getWhereToWatch } from "@/lib/api";
import type { Provider, TitleKind, WhereToWatch } from "@/lib/types";
import { COUNTRY_COOKIE } from "@/lib/watch-country";
import CountryPicker from "./CountryPicker";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type WhereToWatchSectionProps = {
  kind: TitleKind;
  id: number;
  // The page's ?country= (set by the country menu), read inside the Suspense below
  searchParams: SearchParams;
};

// "Where to watch": the services that offer this title legally in the visitor's country,
// like on IMDb. The data is JustWatch's, through TMDB. It waits on its own, so the
// rest of the page shows at once.
export default function WhereToWatchSection(props: WhereToWatchSectionProps) {
  return (
    <section id="where-to-watch" className="mx-auto max-w-5xl scroll-mt-20 px-6 pt-12">
      <Suspense fallback={<div className="h-44 animate-pulse rounded-2xl bg-zinc-900" />}>
        <Offers {...props} />
      </Suspense>
    </section>
  );
}

// The country to show: the one picked in the menu, else the last one picked (cookie),
// else the region in the browser's language ("ar-SA" -> SA). The API falls back to the US.
async function pickCountry(searchParams: SearchParams) {
  const picked = (await searchParams).country;
  if (typeof picked === "string" && /^[A-Za-z]{2}$/.test(picked)) {
    return picked.toUpperCase();
  }
  const remembered = (await cookies()).get(COUNTRY_COOKIE)?.value;
  if (remembered && /^[A-Z]{2}$/.test(remembered)) {
    return remembered;
  }
  const language = (await headers()).get("accept-language") ?? "";
  return language.match(/^[a-z]{2,3}-([A-Z]{2})\b/i)?.[1]?.toUpperCase() ?? "";
}

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryName = (code: string) => {
  try {
    return countryNames.of(code) ?? code;
  } catch {
    return code;
  }
};

const GROUPS: { key: keyof Pick<WhereToWatch, "stream" | "free" | "ads" | "rent" | "buy">; label: string }[] = [
  { key: "stream", label: "Stream" },
  { key: "free", label: "Free" },
  { key: "ads", label: "Free with ads" },
  { key: "rent", label: "Rent" },
  { key: "buy", label: "Buy" },
];

async function Offers({ kind, id, searchParams }: WhereToWatchSectionProps) {
  const data = await getWhereToWatch(kind, id, await pickCountry(searchParams));
  // TMDB can't be reached (or the server has no token): leave the section out
  if (!data) {
    return null;
  }

  const groups = GROUPS.filter((group) => data[group.key].length > 0);
  const here = countryName(data.country);
  const options = [...new Set([...data.countries, data.country])]
    .map((code): [string, string] => [code, countryName(code)])
    .sort((a, b) => a[1].localeCompare(b[1]));

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Where to watch</h2>
          <p className="mt-1 text-sm text-zinc-400">Legal ways to watch it in {here}.</p>
        </div>
        {data.countries.length > 0 && <CountryPicker value={data.country} options={options} />}
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        {groups.length === 0 ? (
          <p className="text-zinc-400">
            {data.countries.length > 0
              ? `Not offered in ${here} right now. Try another country.`
              : "No streaming, rental or purchase offers found for this title."}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {groups.map((group) => (
              <div key={group.key}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">{group.label}</h3>
                <ul className="flex flex-wrap gap-3">
                  {data[group.key].map((provider) => (
                    <li key={provider.id}>
                      <ProviderLink provider={provider} href={data.link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* TMDB and JustWatch ask to be credited wherever their data is shown */}
        <p className="mt-6 border-t border-white/5 pt-4 text-xs text-zinc-500">
          Offers from{" "}
          <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300">
            JustWatch
          </a>{" "}
          via{" "}
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300">
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </>
  );
}

// A service's logo. TMDB's page for the offers links on to the title on each service.
function ProviderLink({ provider, href }: { provider: Provider; href: string | null }) {
  const content = provider.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={provider.logo} alt={provider.name} width={48} height={48} loading="lazy" className="h-12 w-12 rounded-xl" />
  ) : (
    <span className="grid h-12 min-w-12 place-items-center rounded-xl bg-zinc-800 px-2 text-xs">{provider.name}</span>
  );
  const className = "block rounded-xl ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-amber-400";

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" title={provider.name} className={className}>
      {content}
    </a>
  ) : (
    <span title={provider.name} className={className}>
      {content}
    </span>
  );
}
