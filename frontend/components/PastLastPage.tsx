import Link from "next/link";

// Shown for a page number past the end of a list (an old link, or the list got shorter)
export default function PastLastPage({ href }: { href: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-zinc-400">
      This page is empty.{" "}
      <Link href={href} className="text-amber-400 hover:text-amber-300">
        Go to the first page
      </Link>
    </div>
  );
}
