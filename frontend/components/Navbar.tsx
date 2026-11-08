import { Suspense } from "react";
import Link from "next/link";
import NavLink from "./NavLink";
import UserMenu, { UserMenuSkeleton } from "./UserMenu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400 text-sm text-zinc-950">
            ▶
          </span>
          <span className="hidden sm:inline">
            Movies<span className="text-amber-400">Platform</span>
          </span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <NavLink href="/movies">Movies</NavLink>
          <NavLink href="/series">Series</NavLink>
          <NavLink href="/actors">Actors</NavLink>
          {/* The links above are the same for everyone, so they are part of the
              instant static shell; only the account part waits for the cookie */}
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}
