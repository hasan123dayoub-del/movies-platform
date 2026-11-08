export default function Loading() {
  return (
    <div className="animate-pulse">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <div className="h-4 w-24 rounded bg-zinc-800" />
          <div className="mt-8 grid gap-8 sm:grid-cols-[220px_1fr] md:grid-cols-[260px_1fr] md:gap-12">
            <div className="aspect-2/3 w-48 rounded-2xl bg-zinc-800 sm:w-full" />
            <div className="space-y-4 self-end">
              <div className="h-6 w-24 rounded-full bg-zinc-800" />
              <div className="h-12 w-3/4 rounded bg-zinc-800" />
              <div className="h-10 w-1/2 rounded bg-zinc-800" />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 h-8 w-24 rounded bg-zinc-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-2xl bg-zinc-800" />
          ))}
        </div>
      </section>
    </div>
  );
}
