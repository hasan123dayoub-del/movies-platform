export default function Loading() {
  return (
    <div className="animate-pulse">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <div className="h-4 w-24 rounded bg-zinc-800" />
          <div className="mt-8 flex items-center gap-8">
            <div className="h-28 w-28 rounded-full bg-zinc-800" />
            <div className="flex-1 space-y-4">
              <div className="h-12 w-2/3 max-w-md rounded bg-zinc-800" />
              <div className="h-10 w-full max-w-lg rounded bg-zinc-800" />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 h-8 w-40 rounded bg-zinc-800" />
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="aspect-2/3 rounded-2xl bg-zinc-800" />
          ))}
        </div>
      </section>
    </div>
  );
}
