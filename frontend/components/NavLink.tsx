"use client"; // usePathname reads the URL in the browser

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  // Extra classes, e.g. a bigger tap area in the phone menu
  className?: string | undefined;
};

const baseClass = "transition hover:text-white";

// A navbar link that lights up when you are on its section.
// The URL is only known at request time, so the page is first built with a
// plain (not lit) link, and the lit one swaps in once the URL is read.
export default function NavLink({ href, children, className = "" }: NavLinkProps) {
  return (
    <Suspense
      fallback={
        <Link href={href} className={`${baseClass} text-zinc-400 ${className}`}>
          {children}
        </Link>
      }
    >
      <ActiveLink href={href} className={className}>
        {children}
      </ActiveLink>
    </Suspense>
  );
}

function ActiveLink({ href, children, className = "" }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`${baseClass} ${isActive ? "text-white" : "text-zinc-400"} ${className}`}
    >
      {children}
    </Link>
  );
}
