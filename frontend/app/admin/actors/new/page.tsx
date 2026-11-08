import Link from "next/link";
import type { Metadata } from "next";
import ActorForm from "@/components/ActorForm";
import { createActorAction } from "@/app/admin/actors/actions";

export const metadata: Metadata = { title: "Add an actor" };

// Nothing to load from the API, so no async here
export default function NewActorPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin/actors" className="text-sm text-zinc-400 transition hover:text-white">
        ← Back to actors
      </Link>
      <h1 className="mt-4 mb-8 text-3xl font-bold">Add an actor</h1>

      <ActorForm action={createActorAction} submitLabel="Add actor" />
    </section>
  );
}
