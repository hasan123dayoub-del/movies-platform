export default function Loading() {
  return (
    <section className="mx-auto max-w-6xl animate-pulse px-6 py-12">
      <div className="h-4 w-16 rounded bg-zinc-800" />
      <div className="mt-2 mb-6 h-9 w-40 rounded bg-zinc-800" />
      <div className="space-y-px overflow-hidden rounded-2xl border border-white/10">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="h-12 bg-zinc-900" />
        ))}
      </div>
    </section>
  );
}
