import { Suspense } from "react";
import Link from "next/link";
import NavLink from "./NavLink";
import MobileMenu from "./MobileMenu";
import UserMenu, { UserMenuSkeleton } from "./UserMenu";

const sections = [
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
  { href: "/actors", label: "Actors" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400 text-sm text-zinc-950">
            ▶
          </span>
          <span>
            Movies<span className="text-amber-400">Platform</span>
          </span>
        </Link>

        {/* Computers and tablets: everything in one row */}
        <div className="hidden items-center gap-6 text-sm font-medium md:flex">
          {sections.map((s) => (
            <NavLink key={s.href} href={s.href}>
              {s.label}
            </NavLink>
          ))}
          {/* The links above are the same for everyone, so they are part of the
              instant static shell; only the account part waits for the cookie */}
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
        </div>

        {/* Phones: a ☰ button that opens the same links in a panel */}
        <MobileMenu>
          <div className="flex flex-col text-base font-medium">
            {sections.map((s) => (
              <NavLink key={s.href} href={s.href} className="border-b border-white/5 py-3">
                {s.label}
              </NavLink>
            ))}
          </div>
          <div className="pt-4 text-sm font-medium">
            <Suspense fallback={<UserMenuSkeleton />}>
              <UserMenu />
            </Suspense>
          </div>
        </MobileMenu>
      </nav>
    </header>
  );
}
