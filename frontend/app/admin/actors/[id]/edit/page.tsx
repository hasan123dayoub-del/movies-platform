import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActor } from "@/lib/api";
import ActorForm from "@/components/ActorForm";
import { updateActorAction } from "@/app/admin/actors/actions";

export const metadata: Metadata = { title: "Edit actor" };

export default async function EditActorPage({
  params,
}: PageProps<"/admin/actors/[id]/edit">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const actor = await getActor(Number(id));
  if (!actor) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin/actors" className="text-sm text-zinc-400 transition hover:text-white">
        ← Back to actors
      </Link>
      <h1 className="mt-4 mb-8 text-3xl font-bold">
        Edit <span className="text-amber-400">{actor.name}</span>
      </h1>

      <ActorForm
        action={updateActorAction.bind(null, actor.id)}
        actor={actor}
        submitLabel="Save changes"
      />
    </section>
  );
}
