import Link from "next/link";
import { getActors } from "@/lib/api";
import { getAge } from "@/lib/format";
import ActorAvatar from "@/components/ActorAvatar";

export default async function ActorsPage() {
  const actors = await getActors();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
          The people behind the roles
        </p>
        <div className="mt-2 flex items-end justify-between">
          <h1 className="text-4xl font-bold tracking-tight">Actors</h1>
          <p className="text-sm text-zinc-500">{actors.length} actors</p>
        </div>
      </div>

      {actors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-zinc-400">
          No actors yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actors.map((actor) => (
            <Link
              key={actor.id}
              href={`/actors/${actor.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-zinc-800/80"
            >
              <ActorAvatar name={actor.name} />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold transition group-hover:text-amber-400">
                  {actor.name}
                </p>
                <p className="text-sm text-zinc-400">
                  {actor.nationality} · {getAge(actor.birthday)} years old
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
