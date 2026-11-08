// Shown inside the card while the page checks whether you are already logged in
export default function Loading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-7 w-40 rounded bg-zinc-800" />
      <div className="h-4 w-48 rounded bg-zinc-800" />
      {[1, 2].map((n) => (
        <div key={n} className="h-16 rounded-lg bg-zinc-800" />
      ))}
      <div className="h-11 rounded-lg bg-zinc-800" />
    </div>
  );
}
