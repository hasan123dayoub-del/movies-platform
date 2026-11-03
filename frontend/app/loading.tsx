// Shown while the page waits for the API: gray boxes shaped like the real content
export default function Loading() {
  return (
    <div className="animate-pulse">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="h-4 w-28 rounded bg-zinc-800" />
          <div className="mt-4 h-12 w-full max-w-xl rounded bg-zinc-800" />
          <div className="mt-4 h-6 w-full max-w-md rounded bg-zinc-800" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 h-8 w-40 rounded bg-zinc-800" />
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
    </div>
  );
}
