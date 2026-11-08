import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { getActors } from "@/lib/api";
import { getAge } from "@/lib/format";
import { getToday } from "@/lib/today";
import { readSearch } from "@/lib/filters";
import ActorAvatar from "@/components/ActorAvatar";
import SearchBox from "@/components/filters/SearchBox";

export const metadata: Metadata = { title: "Actors" };

// /actors?search=leo
export default async function ActorsPage({ searchParams }: PageProps<"/actors">) {
  const search = readSearch(await searchParams);
  const [actors, today] = await Promise.all([getActors(search), getToday()]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
          The people behind the roles
        </p>
        <div className="mt-2 flex items-end justify-between">
          <h1 className="text-4xl font-bold tracking-tight">Actors</h1>
          <p className="text-sm text-zinc-500" aria-live="polite">
            {actors.length} {actors.length === 1 ? "actor" : "actors"}
            {search && " found"}
          </p>
        </div>
      </div>

      <SearchBox
        action="/actors"
        value={search}
        placeholder="Start typing a name..."
        label="Search actors by name"
      />

      {actors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-zinc-400">
          {search ? (
            <>
              No actors match &ldquo;{search}&rdquo;.{" "}
              <Link href="/actors" className="text-amber-400 hover:text-amber-300">
                Show all actors
              </Link>
            </>
          ) : (
            "No actors yet."
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {actors.map((actor) => (
            <Link
              key={actor.id}
              href={`/actors/${actor.id}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/60"
            >
              <div className="relative aspect-3/4 overflow-hidden bg-zinc-800">
                {actor.photoUrl ? (
                  <Image
                    src={actor.photoUrl}
                    alt={actor.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center">
                    <ActorAvatar actor={actor} size="lg" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="truncate font-semibold transition group-hover:text-amber-400">
                  {actor.name}
                </p>
                <p className="mt-0.5 text-sm text-zinc-400">
                  {actor.nationality} · {getAge(actor.birthday, today)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
