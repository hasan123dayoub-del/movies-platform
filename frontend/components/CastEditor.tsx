"use client"; // useActionState keeps each form's errors in the browser

import { useActionState } from "react";
import Link from "next/link";
import type { Actor, CastMember, FormState } from "@/lib/types";
import { emptyFormState } from "@/lib/form";
import { Field, inputClass, primaryButtonClass } from "@/components/form/Field";
import ActorAvatar from "@/components/ActorAvatar";
import DeleteButton from "@/components/DeleteButton";

// The Server Actions that change the cast of one movie or one series
export type CastActions = {
  add: (ownerId: number, state: FormState, formData: FormData) => Promise<FormState>;
  updateRole: (ownerId: number, actorId: number, state: FormState, formData: FormData) => Promise<FormState>;
  remove: (ownerId: number, actorId: number) => Promise<void>;
};

type CastEditorProps = {
  // The movie or series id
  ownerId: number;
  // "movie" or "series", for the texts
  noun: string;
  cast: CastMember[];
  // Every actor; the ones already in the cast are left out of the picker
  actors: Actor[];
  actions: CastActions;
};

export default function CastEditor({ ownerId, noun, cast, actors, actions }: CastEditorProps) {
  const inCast = new Set(cast.map((member) => member.actor.id));
  const available = actors.filter((actor) => !inCast.has(actor.id));

  return (
    <section id="cast" className="mt-14 scroll-mt-20 border-t border-white/10 pt-10">
      <h2 className="text-2xl font-semibold">Cast</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Who plays in this {noun}, and as whom. Changes are saved right away.
      </p>

      {cast.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center text-zinc-400">
          No actors in this {noun} yet. Add the first one below.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-zinc-900/50">
          {cast.map((member) => (
            <CastRow
              key={member.actor.id}
              ownerId={ownerId}
              noun={noun}
              member={member}
              actions={actions}
            />
          ))}
        </ul>
      )}

      <AddCastForm ownerId={ownerId} noun={noun} actors={available} actions={actions} />
    </section>
  );
}

// One actor in the cast: change their role, or take them out
type RowProps = { ownerId: number; noun: string; member: CastMember; actions: CastActions };

function CastRow({ ownerId, noun, member, actions }: RowProps) {
  const { actor, role } = member;
  const [state, formAction, pending] = useActionState(
    actions.updateRole.bind(null, ownerId, actor.id),
    emptyFormState,
  );

  return (
    <li className="flex flex-wrap items-start gap-4 p-4">
      <ActorAvatar actor={actor} size="sm" />
      <div className="w-40 pt-0.5">
        <p className="truncate font-semibold">{actor.name}</p>
        <p className="truncate text-xs text-zinc-500">{actor.nationality}</p>
      </div>

      <form action={formAction} noValidate className="flex min-w-60 flex-1 gap-2">
        <div className="flex-1">
          <input
            name="role"
            // After a failed save keep what was typed; otherwise the saved role
            defaultValue={state.values.role ?? role}
            aria-label={`Role of ${actor.name}`}
            aria-invalid={Boolean(state.errors.role)}
            className={inputClass}
          />
          {state.errors.role && (
            <p role="alert" className="mt-1.5 text-sm text-red-400">
              {state.errors.role}
            </p>
          )}
        </div>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : "Save"}
        </button>
      </form>

      <div className="pt-1">
        <DeleteButton
          action={actions.remove.bind(null, ownerId, actor.id)}
          name={actor.name}
          label="Remove"
          question={`Remove ${actor.name} from this ${noun}?`}
        />
      </div>
    </li>
  );
}

// Pick an actor who isn't in the cast yet and give them a role
type AddProps = { ownerId: number; noun: string; actors: Actor[]; actions: CastActions };

function AddCastForm({ ownerId, noun, actors, actions }: AddProps) {
  const [state, formAction, pending] = useActionState(
    actions.add.bind(null, ownerId),
    emptyFormState,
  );

  if (actors.length === 0) {
    return (
      <p className="mt-6 text-sm text-zinc-400">
        Every actor is already in this {noun}.{" "}
        <Link href="/admin/actors/new" className="text-amber-400 hover:text-amber-300">
          Add a new actor
        </Link>{" "}
        first.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="mt-6 rounded-2xl border border-dashed border-white/15 p-5"
    >
      <p className="font-medium">Add an actor</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <Field label="Actor" error={state.errors.actorId}>
          <select
            name="actorId"
            defaultValue={state.values.actorId ?? ""}
            aria-invalid={Boolean(state.errors.actorId)}
            className={`${inputClass} scheme-dark`}
          >
            <option value="">Choose an actor...</option>
            {actors.map((actor) => (
              <option key={actor.id} value={actor.id}>
                {actor.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Role" error={state.errors.role}>
          <input
            name="role"
            defaultValue={state.values.role ?? ""}
            placeholder="Bruce Wayne"
            aria-invalid={Boolean(state.errors.role)}
            className={inputClass}
          />
        </Field>

        <button
          type="submit"
          disabled={pending}
          className={`${primaryButtonClass} self-start sm:mt-7`}
        >
          {pending ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Errors that belong to no single field, like "already in this movie" */}
      {state.errors.form && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {state.errors.form}
        </p>
      )}
    </form>
  );
}
