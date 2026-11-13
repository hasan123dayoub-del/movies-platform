"use client"; // listens to the keyboard (or a TV remote's arrow keys)

import { useEffect } from "react";

// TV remotes have arrows and an OK button, no mouse. Browsers on TVs turn the arrows
// into arrow-key presses, which on a normal page only scroll it. Here an arrow moves the
// selection to the nearest link or button in that direction instead (like Netflix or
// YouTube on a TV), and OK (Enter) opens it, as Enter always does on a selected link.

const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), video[controls], [tabindex]:not([tabindex='-1'])";

const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
} as const;

type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];

// Shown and on screen space (pages kept hidden in memory have no size)
function isVisible(el: Element) {
  const box = el.getBoundingClientRect();
  return box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== "hidden";
}

// The best item in that direction: mostly ahead and close, little to the side
function nearest(from: DOMRect, { x, y }: Direction) {
  const fromX = from.left + from.width / 2;
  const fromY = from.top + from.height / 2;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const el of document.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (el === document.activeElement || !isVisible(el)) continue;
    const box = el.getBoundingClientRect();
    // Must be past the current item's edge in that direction
    const ahead =
      x > 0 ? box.left - from.right : x < 0 ? from.left - box.right : y > 0 ? box.top - from.bottom : from.top - box.bottom;
    if (ahead < -1) continue;
    // How far off to the side: 0 when the two overlap across the direction of travel
    // (a wide trailer right above a logo is "straight up" even if its centre is not)
    const side =
      x !== 0
        ? Math.max(0, Math.max(from.top, box.top) - Math.min(from.bottom, box.bottom))
        : Math.max(0, Math.max(from.left, box.left) - Math.min(from.right, box.right));
    // Between equal choices, prefer the one whose centre lines up best
    const toX = box.left + box.width / 2;
    const toY = box.top + box.height / 2;
    const offCentre = x !== 0 ? Math.abs(toY - fromY) : Math.abs(toX - fromX);
    const score = Math.max(ahead, 0) + side * 2 + offCentre * 0.1;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
}

// Where the arrows keep their usual job: left/right move the cursor in a text box and
// skip back/forward in the video; up/down move between lines of a long text until its
// first or last line. Everywhere else they move the selection.
function arrowsBelongTo(el: Element | null, key: string) {
  const sideways = key === "ArrowLeft" || key === "ArrowRight";
  if (el instanceof HTMLVideoElement) return sideways;
  if (el instanceof HTMLInputElement) return sideways && !["checkbox", "radio", "button", "submit"].includes(el.type);
  if (el instanceof HTMLTextAreaElement) {
    if (sideways) return true;
    const atStart = el.selectionStart === 0;
    const atEnd = el.selectionEnd === el.value.length;
    return key === "ArrowUp" ? !atStart : !atEnd;
  }
  return el instanceof HTMLElement && el.isContentEditable;
}

export default function SpatialNavigation() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const direction = DIRECTIONS[event.key as keyof typeof DIRECTIONS];
      if (!direction || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;

      const current = document.activeElement;
      if (arrowsBelongTo(current, event.key)) return;

      const hasCurrent = current instanceof HTMLElement && current !== document.body && isVisible(current);
      // Nothing selected yet: start from the top of what is on screen
      const from = hasCurrent
        ? current.getBoundingClientRect()
        : new DOMRect(innerWidth / 2, direction.y < 0 ? innerHeight : 0, 0, 0);
      const next = nearest(from, direction);
      if (!next) {
        // A closed menu would change its choice on an arrow (e.g. the country, which
        // reloads the offers): never let an arrow do that, OK opens the menu instead
        if (current instanceof HTMLSelectElement) event.preventDefault();
        // Anywhere else (e.g. the end of the page) the arrow scrolls as usual
        return;
      }

      event.preventDefault();
      next.focus({ preventScroll: true });
      // In the middle of the screen, so the sticky navbar never hides it
      next.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
