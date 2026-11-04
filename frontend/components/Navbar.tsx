import Link from "next/link";
import NavLink from "./NavLink";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400 text-sm text-zinc-950">
            ▶
          </span>
          Movies<span className="text-amber-400">Platform</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <NavLink href="/">Movies</NavLink>
          <NavLink href="/actors">Actors</NavLink>
          <NavLink href="/admin">Admin</NavLink>
        </div>
      </nav>
    </header>
  );
}
