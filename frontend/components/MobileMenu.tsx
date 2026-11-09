"use client"; // remembers whether the menu is open

import { useEffect, useState } from "react";

// The ☰ button and its drop-down panel, for phones only (hidden from `md` up).
// The links inside come from the server as `children`, so the account part
// (UserMenu) still reads the cookie on the server.
export default function MobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Escape closes the menu, like any pop-up
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="grid h-10 w-10 place-items-center rounded-lg text-zinc-300 transition hover:bg-white/5 hover:text-white"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div
        id="mobile-menu"
        // Hidden with CSS rather than removed, so its server-made content stays ready
        className={`${open ? "block" : "hidden"} absolute inset-x-0 top-16 border-b border-white/10 bg-zinc-950 px-6 pt-2 pb-5 shadow-2xl shadow-black/60`}
        // Picking a link (or Log out) closes the menu
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a, button")) setOpen(false);
        }}
      >
        {children}
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
