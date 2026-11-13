import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/(auth)/actions";
import NavLink from "./NavLink";
import AuthLinks from "./auth/AuthLinks";

// The right side of the navbar: depends on who is visiting, so it reads the cookie.
// The Navbar wraps it in <Suspense>: the rest of the page doesn't wait for it.
export default async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    // They bring the visitor back to this page after logging in or signing up
    return <AuthLinks />;
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
