"use client"; // useActionState keeps the form's errors in the browser

import { useActionState, useState } from "react";
import type { FormState, Review } from "@/lib/types";
import { emptyFormState } from "@/lib/form";
import { inputClass, primaryButtonClass } from "@/components/form/Field";

type ReviewFormProps = {
  // saveReviewAction already bound to this title (in the page)
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  // The visitor's current review, to edit it
  review: Review | null;
};

// Pick 1 to 10 stars and optionally write a few words.
// The page gives it a new `key` after each save, so it starts again from the saved review.
export default function ReviewForm({ action, review }: ReviewFormProps) {
  const [state, formAction, pending] = useActionState(action, emptyFormState);
  // What a failed try typed wins, then the saved review
  const startRating = Number(state.values.rating) || review?.rating || 0;
  const [rating, setRating] = useState(startRating);
  // While the mouse is over a star, show what clicking it would give
  const [hovered, setHovered] = useState(0);
  const shown = hovered || rating;

  return (
    <form action={formAction} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-300">
          Your rating{" "}
          <span className="text-zinc-500">{shown ? `${shown}/10` : "(pick 1 to 10)"}</span>
        </legend>
        <div className="flex flex-wrap gap-1" onMouseLeave={() => setHovered(0)}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            // Real radio buttons underneath: keyboard arrows and screen readers work
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHovered(n)}>
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="peer sr-only"
                aria-label={`${n} out of 10`}
              />
              <span
                aria-hidden
                className={`block text-2xl leading-none transition peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 ${
                  n <= shown ? "text-amber-400" : "text-zinc-700 hover:text-zinc-500"
                }`}
              >
                ★
              </span>
            </label>
          ))}
        </div>
        {state.errors.rating && (
          <p role="alert" className="mt-1.5 text-sm text-red-400">
            {state.errors.rating}
          </p>
        )}
      </fieldset>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-300">
          Your review <span className="text-zinc-500">(optional)</span>
        </span>
        <textarea
          name="comment"
          rows={3}
          dir="auto"
          maxLength={1000}
          defaultValue={state.values.comment ?? review?.comment ?? ""}
          placeholder="What did you think?"
          aria-invalid={Boolean(state.errors.comment)}
          className={inputClass}
        />
        {state.errors.comment && (
          <span role="alert" className="mt-1.5 block text-sm text-red-400">
            {state.errors.comment}
          </span>
        )}
      </label>

      {state.errors.form && (
        <p role="alert" className="text-sm text-red-400">
          {state.errors.form}
        </p>
      )}

      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Saving..." : review ? "Update review" : "Post review"}
      </button>
    </form>
  );
}
