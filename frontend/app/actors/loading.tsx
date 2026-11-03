export default function Loading() {
  return (
    <section className="mx-auto max-w-6xl animate-pulse px-6 py-12">
      <div className="h-4 w-48 rounded bg-zinc-800" />
      <div className="mt-3 mb-8 h-10 w-40 rounded bg-zinc-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-24 rounded-2xl bg-zinc-800" />
        ))}
      </div>
    </section>
  );
}
