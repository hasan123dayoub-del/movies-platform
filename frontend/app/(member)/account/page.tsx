import type { Metadata } from "next";
import Link from "next/link";
import { getMyReviews } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { readPage } from "@/lib/filters";
import { NameForm, PasswordForm } from "@/components/account/AccountForms";
import Pagination from "@/components/Pagination";
import Poster from "@/components/Poster";

export const metadata: Metadata = { title: "My account" };

// /account: the member's details, their password, and everything they reviewed.
// proxy.ts already sent visitors without a session to the login page.
export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const user = await requireUser("/account");
  const page = readPage(await searchParams);
  const reviews = (await getMyReviews(page)) ?? {
    data: [],
    meta: { page: 1, perPage: 10, total: 0, totalPages: 1 },
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
        {user.role === "ADMIN" ? "Admin" : "Member"} since {formatDate(user.createdAt)}
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">My account</h1>
      <p className="mt-2 text-zinc-400">{user.email}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-8">
          <Card title="Your name">
            <NameForm name={user.name} />
          </Card>
          <Card title="Change password">
            <PasswordForm />
          </Card>
          <Link
            href="/watchlist"
            className="block rounded-2xl border border-white/10 bg-zinc-900/60 p-5 transition hover:border-white/25"
          >
            <p className="font-semibold">My watchlist →</p>
            <p className="mt-1 text-sm text-zinc-400">The movies and series you saved for later.</p>
          </Link>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">
            My reviews <span className="text-base font-normal text-zinc-500">({reviews.meta.total})</span>
          </h2>
          {reviews.data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-zinc-400">
              You haven&apos;t reviewed anything yet. Open any{" "}
              <Link href="/movies" className="text-amber-400 hover:text-amber-300">
                movie
              </Link>{" "}
              or{" "}
              <Link href="/series" className="text-amber-400 hover:text-amber-300">
                series
              </Link>{" "}
              and rate it.
            </div>
          ) : (
            <ul className="space-y-3">
              {reviews.data.map((review) => {
                const title = review.movie ?? review.series!;
                const href = `${review.movie ? "/movies" : "/series"}/${title.id}#reviews`;
                return (
                  <li key={review.id}>
                    <Link
                      href={href}
                      className="group flex gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-white/25"
                    >
                      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                        <Poster movie={title} sizes="64px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p dir="auto" className="truncate text-left font-semibold transition group-hover:text-amber-400">
                              {title.title}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {review.movie ? "Movie" : "Series"} · {formatDate(review.updatedAt)}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-amber-400/10 px-2.5 py-1 text-sm font-semibold text-amber-400">
                            ★ {review.rating}/10
                          </span>
                        </div>
                        {review.comment && (
                          <p dir="auto" className="mt-2 line-clamp-2 text-sm text-zinc-300">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Pagination meta={reviews.meta} path="/account" />
        </div>
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}
