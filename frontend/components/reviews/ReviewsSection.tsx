import { Suspense } from "react";
import Link from "next/link";
import { getMyReview, getReviews } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  deleteMyReviewAction,
  deleteReviewAsAdminAction,
  saveReviewAction,
} from "@/app/(member)/actions";
import type { TitleKind } from "@/lib/types";
import DeleteButton from "@/components/DeleteButton";
import Pagination from "@/components/Pagination";
import ReviewForm from "./ReviewForm";

type Target = { kind: TitleKind; id: number; path: string };

type ReviewsSectionProps = Target & {
  // The page's ?page= (which page of reviews), read inside the Suspense below
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Members' reviews under a movie or a series: the visitor's own review form,
// then everyone's reviews. Both parts wait on their own, so the page above shows at once.
export default function ReviewsSection({ searchParams, ...target }: ReviewsSectionProps) {
  return (
    <section id="reviews" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-16">
      <h2 className="mb-6 text-2xl font-semibold">Reviews</h2>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="lg:order-2">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-zinc-900" />}>
            <MyReview {...target} />
          </Suspense>
        </div>
        <div className="lg:order-1">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-zinc-900" />}>
            <ReviewList {...target} searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

// The visitor's side: "log in to review", or the form with their review in it
async function MyReview(target: Target) {
  const user = await getCurrentUser();
  const box = "rounded-2xl border border-white/10 bg-zinc-900/60 p-6";

  if (!user) {
    return (
      <div className={`${box} text-center`}>
        <p className="font-medium">Seen it? Rate it.</p>
        <p className="mt-1 text-sm text-zinc-400">Log in to rate this and write a review.</p>
        <Link
          href={`/login?next=${encodeURIComponent(target.path + "#reviews")}`}
          className="mt-4 inline-block rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
        >
          Log in to review
        </Link>
      </div>
    );
  }

  const review = await getMyReview(target.kind, target.id);
  return (
    <div className={box}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{review ? "Your review" : "Write a review"}</p>
          {review && (
            <p className="text-xs text-zinc-500">Last changed {formatDate(review.updatedAt)}</p>
          )}
        </div>
        {review && (
          <DeleteButton
            action={deleteMyReviewAction.bind(null, target)}
            name="your review"
            question="Delete your review?"
          />
        )}
      </div>
      {/* A new key after each save: the form starts again from the saved review */}
      <ReviewForm
        key={review?.updatedAt ?? "new"}
        action={saveReviewAction.bind(null, target)}
        review={review}
      />
    </div>
  );
}

// Everyone's reviews, the latest first, 10 per page
async function ReviewList({ searchParams, ...target }: ReviewsSectionProps) {
  const pageParam = Number((await searchParams).page);
  const page = Number.isInteger(pageParam) && pageParam > 1 ? pageParam : 1;
  const [{ data, meta, stats }, user] = await Promise.all([
    getReviews(target.kind, target.id, page),
    getCurrentUser(),
  ]);

  return (
    <div>
      <p className="mb-4 text-sm text-zinc-400" aria-live="polite">
        {stats.count === 0 ? (
          "No reviews yet. Be the first!"
        ) : (
          <>
            <span className="text-amber-400">★</span>{" "}
            <span className="font-semibold text-white">{stats.average?.toFixed(1)}</span>/10 from{" "}
            {stats.count} {stats.count === 1 ? "member" : "members"}
          </>
        )}
      </p>

      <ul className="space-y-3">
        {data.map((review) => (
          <li key={review.id} className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300">
                {review.user.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {review.user.name}
                  {user?.id === review.user.id && <span className="ml-2 text-xs text-amber-400">You</span>}
                </p>
                <p className="text-xs text-zinc-500">{formatDate(review.updatedAt)}</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-400/10 px-2.5 py-1 text-sm font-semibold text-amber-400">
                ★ {review.rating}/10
              </span>
              {/* Admins can remove anyone else's review */}
              {user?.role === "ADMIN" && user.id !== review.user.id && (
                <DeleteButton
                  action={deleteReviewAsAdminAction.bind(null, target, review.id)}
                  name={`${review.user.name}'s review`}
                  label="Remove"
                  question={`Remove ${review.user.name}'s review?`}
                />
              )}
            </div>
            {review.comment && (
              <p dir="auto" className="mt-3 whitespace-pre-line leading-relaxed text-zinc-300">
                {review.comment}
              </p>
            )}
          </li>
        ))}
      </ul>

      <Pagination meta={meta} path={target.path} />
    </div>
  );
}

// "Members ★ 8.7 (3)" next to a title's rating; links down to the reviews
export async function MembersRating({ kind, id }: { kind: TitleKind; id: number }) {
  const { stats } = await getReviews(kind, id);
  return (
    <a href="#reviews" className="group block">
      <p className="text-xs uppercase tracking-wider text-zinc-500">Members</p>
      <p className="font-medium transition group-hover:text-amber-400">
        {stats.average === null ? (
          "Not rated yet"
        ) : (
          <>
            ★ {stats.average.toFixed(1)}{" "}
            <span className="text-sm font-normal text-zinc-500">({stats.count})</span>
          </>
        )}
      </p>
    </a>
  );
}
