"use client"; // usePathname reads the URL in the browser

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

// A navbar link that lights up when you are on its section
export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === "/"
      ? pathname === "/" || pathname.startsWith("/movies")
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`transition hover:text-white ${isActive ? "text-white" : "text-zinc-400"}`}
    >
      {children}
    </Link>
  );
}
