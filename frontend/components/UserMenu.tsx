import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/(auth)/actions";
import NavLink from "./NavLink";

// The right side of the navbar: depends on who is visiting, so it reads the cookie.
// The Navbar wraps it in <Suspense>: the rest of the page doesn't wait for it.
export default async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-zinc-400 transition hover:text-white">
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-amber-400 px-3.5 py-1.5 font-semibold text-zinc-950 transition hover:bg-amber-300"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <NavLink href="/watchlist">Watchlist</NavLink>
      {user.role === "ADMIN" && <NavLink href="/admin">Admin</NavLink>}
      <div className="flex items-center gap-3 border-l border-white/10 pl-6">
        {/* The name opens the account page */}
        <NavLink href="/account" className="max-w-32 truncate">
          {user.name}
        </NavLink>
        {/* A form, not a link: logging out changes data, so it must not be a GET */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg px-2.5 py-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

// Same size as the menu, shown for the moment before we know who is visiting
export function UserMenuSkeleton() {
  return <div className="h-8 w-36 animate-pulse rounded-lg bg-zinc-800/60" />;
}
