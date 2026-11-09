// Shown while the page checks the login and loads the list
export default function Loading() {
  return (
    <section className="mx-auto max-w-6xl animate-pulse px-6 py-12">
      <div className="h-4 w-32 rounded bg-zinc-800" />
      <div className="mt-3 h-10 w-64 rounded bg-zinc-800" />
      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="aspect-2/3 rounded-2xl bg-zinc-800" />
        ))}
      </div>
    </section>
  );
}
