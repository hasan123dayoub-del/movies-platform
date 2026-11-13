"use client"; // reads the address the visitor is on

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

// "Log in" and "Sign up" in the navbar. Each one carries the page the visitor is on
// (?next=/movies/3), so after logging in or signing up they come back to it instead
// of landing on the home page and having to find the movie again.
export default function AuthLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // On the login or sign-up page itself, keep the page it was opened for
  const onAuthPage = pathname === "/login" || pathname === "/register";
  const search = searchParams.toString();
  const here = onAuthPage ? (searchParams.get("next") ?? "/") : pathname + (search ? `?${search}` : "");
  const query = here === "/" ? "" : `?next=${encodeURIComponent(here)}`;

  return (
    <div className="flex items-center gap-3">
      <Link href={`/login${query}`} className="text-zinc-400 transition hover:text-white">
        Log in
      </Link>
      <Link
        href={`/register${query}`}
        className="rounded-lg bg-amber-400 px-3.5 py-1.5 font-semibold text-zinc-950 transition hover:bg-amber-300"
      >
        Sign up
      </Link>
    </div>
  );
}
