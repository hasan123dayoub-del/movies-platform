import Link from "next/link";
import type { PageMeta } from "@/lib/types";
import { toQuery } from "@/lib/api/query";

type PaginationProps = {
  meta: PageMeta;
  // The list page, e.g. "/movies"
  path: string;
  // The filters in the URL now; every page link keeps them (?search=dark&page=2)
  query?: Record<string, string | undefined>;
};

// The page numbers to show: always the first and last, and the ones around the
// current page; a gap ("…") stands for the rest.  e.g. 1 … 4 [5] 6 … 12
function pageNumbers(current: number, last: number): (number | "gap")[] {
  const pages: (number | "gap")[] = [];
  for (let n = 1; n <= last; n++) {
    if (n === 1 || n === last || Math.abs(n - current) <= 1) {
      pages.push(n);
    } else if (pages.at(-1) !== "gap") {
      pages.push("gap");
    }
  }
  return pages;
}

// "← Previous  1 2 3  Next →" under a list. Plain links: each page has its own URL,
// so it can be shared, bookmarked, and the Back button works.
export default function Pagination({ meta, path, query = {} }: PaginationProps) {
  const { page, totalPages, total, perPage } = meta;
  if (totalPages <= 1) return null;

  // Page 1 has no ?page in its URL (/movies, not /movies?page=1)
  const href = (n: number) => `${path}${toQuery({ ...query, page: n > 1 ? String(n) : undefined })}`;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const button = "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition";
  const idle = "border border-white/10 text-zinc-300 hover:border-white/25 hover:text-white";

  return (
    <nav aria-label="Pages" className="mt-10 flex flex-col items-center gap-4">
      <ul className="flex items-center justify-center gap-1.5 sm:gap-2">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} className={`${button} ${idle}`} rel="prev">
              ← <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
            </Link>
          ) : (
            <span className={`${button} border border-white/5 text-zinc-600`} aria-disabled>
              ← <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
            </span>
          )}
        </li>

        {pageNumbers(page, totalPages).map((n, i) =>
          n === "gap" ? (
            // Phones only show the pages next to this one (the row must fit)
            <li key={`gap-${i}`} className="hidden px-1 text-zinc-600 sm:block" aria-hidden>
              …
            </li>
          ) : (
            <li key={n} className={Math.abs(n - page) > 1 ? "hidden sm:block" : undefined}>
              {n === page ? (
                <span aria-current="page" className={`${button} bg-amber-400 text-zinc-950`}>
                  {n}
                </span>
              ) : (
                <Link href={href(n)} className={`${button} ${idle}`} aria-label={`Page ${n}`}>
                  {n}
                </Link>
              )}
            </li>
          ),
        )}

        <li>
          {page < totalPages ? (
            <Link href={href(page + 1)} className={`${button} ${idle}`} rel="next">
              <span className="sr-only sm:not-sr-only sm:mr-1">Next</span> →
            </Link>
          ) : (
            <span className={`${button} border border-white/5 text-zinc-600`} aria-disabled>
              <span className="sr-only sm:not-sr-only sm:mr-1">Next</span> →
            </span>
          )}
        </li>
      </ul>

      <p className="text-sm text-zinc-500">
        Showing {from}–{to} of {total}
      </p>
    </nav>
  );
}
