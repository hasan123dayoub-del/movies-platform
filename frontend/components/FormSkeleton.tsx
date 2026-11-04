// Loading state for the add and edit pages
export default function FormSkeleton() {
  return (
    <section className="mx-auto max-w-4xl animate-pulse px-6 py-12">
      <div className="h-4 w-28 rounded bg-zinc-800" />
      <div className="mt-4 mb-8 h-9 w-56 rounded bg-zinc-800" />
      <div className="grid gap-8 md:grid-cols-[1fr_220px]">
        <div className="space-y-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 rounded-lg bg-zinc-800" />
          ))}
        </div>
        <div className="aspect-2/3 rounded-2xl bg-zinc-800" />
      </div>
    </section>
  );
}
