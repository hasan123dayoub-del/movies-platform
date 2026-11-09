import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import NavLink from "@/components/NavLink";

// Admin pages stay out of search engines
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Movies Platform" },
  robots: { index: false, follow: false },
};

// Wraps every /admin page: the tabs stay on top, the page changes below
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <div className="border-b border-white/10 bg-zinc-900/40">
        <nav className="mx-auto flex max-w-6xl gap-6 px-6 py-3 text-sm font-medium">
          <NavLink href="/admin/stats">Overview</NavLink>
          <NavLink href="/admin/movies">Movies</NavLink>
          <NavLink href="/admin/series">Series</NavLink>
          <NavLink href="/admin/actors">Actors</NavLink>
        </nav>
      </div>
      {/* The check reads the cookie, so it sits behind Suspense: the tabs above show at once */}
      <Suspense fallback={<GateSkeleton />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </>
  );
}

// Only admins see the admin pages
async function AdminGate({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // The cookie was there (the proxy let us in) but the session is expired or invalid
  if (!user) {
    redirect("/login?next=/admin");
  }

  if (user.role !== "ADMIN") {
    return (
      <div role="alert" className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-2xl font-semibold">Admins only</h1>
        <p className="mt-2 text-zinc-400">
          You&apos;re logged in as {user.name}, but this area is for admins.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-zinc-950 transition hover:bg-amber-300"
        >
          Back home
        </Link>
      </div>
    );
  }

  return children;
}

function GateSkeleton() {
  return (
    <section className="mx-auto max-w-6xl animate-pulse px-6 py-12">
      <div className="h-4 w-16 rounded bg-zinc-800" />
      <div className="mt-2 mb-6 h-9 w-40 rounded bg-zinc-800" />
      <div className="h-64 rounded-2xl bg-zinc-900" />
    </section>
  );
}
