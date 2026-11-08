// The (auth) folder groups /login and /register without adding "auth" to the URL.
// This layout centers their card on the page.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900/60 p-8 shadow-2xl shadow-black/40">
        {children}
      </div>
    </div>
  );
}
