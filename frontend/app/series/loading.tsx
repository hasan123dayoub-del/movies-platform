export default function Loading() {
  return (
    <section className="mx-auto max-w-6xl animate-pulse px-6 py-12">
      <div className="h-4 w-48 rounded bg-zinc-800" />
      <div className="mt-3 mb-8 h-10 w-40 rounded bg-zinc-800" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="overflow-hidden rounded-2xl border border-white/10">
            <div className="aspect-2/3 bg-zinc-800" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-16 rounded bg-zinc-800" />
              <div className="h-5 w-3/4 rounded bg-zinc-800" />
              <div className="h-4 w-1/2 rounded bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
