import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="text-7xl font-black text-amber-400">404</p>
      <h1 className="mt-4 text-2xl font-semibold">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-zinc-400">
        The movie or actor you&apos;re looking for may have been removed.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-zinc-950 transition hover:bg-amber-300"
      >
        Back to movies
      </Link>
    </div>
  );
}
