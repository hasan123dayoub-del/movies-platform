"use client"; // listens to the keyboard (or a TV remote's arrow keys)

import { useEffect } from "react";

// TV remotes have arrows, OK and Back, no mouse. Browsers on TVs turn the arrows into
// arrow-key presses, which on a normal page only scroll it. Here they move the selection
// the way TV apps do, in rows:
//   Up / Down     go to the row just above / below (never jumping over a row), to the
//                 item in it that lines up best with the current one
//   Left / Right  go to the next item in the same row, and stop at its end
//   OK (Enter)    opens a link or presses a button, picks a star, and starts typing in a box
//                 (a TV opens its on-screen keyboard as soon as a text box is selected, so a
//                 box reached with the arrows is only selected until OK is pressed)
//   Back          leaves full screen
// Positions are measured on the whole page, not the screen, so the navbar that stays
// stuck at the top of the screen counts as the top row of the page.

// Not the <video> itself: OK does nothing on it, so the arrows go to the buttons under it
const FOCUSABLE =
  "a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
} as const;

const BACK_KEYS = new Set(["Escape", "GoBack", "BrowserBack", "XF86Back"]);
const BACK_KEY_CODES = new Set([10009, 461]); // Samsung, LG

type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];
type Box = { el: HTMLElement; top: number; bottom: number; left: number; right: number };

// Something stuck to the screen (the navbar) keeps the place it has at the top of the page
function isStuck(el: HTMLElement) {
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    const position = getComputedStyle(node).position;
    if (position === "sticky" || position === "fixed") return true;
  }
  return false;
}

// Where an item is on the page. A choice hidden behind a picture (the rating stars are
// radio buttons drawn as stars) is where its picture is.
function boxOf(el: HTMLElement): Box | null {
  let rect = el.getBoundingClientRect();
  if (rect.width <= 2 && rect.height <= 2 && el instanceof HTMLInputElement && el.labels?.[0]) {
    rect = el.labels[0].getBoundingClientRect();
  }
  if (rect.width === 0 || rect.height === 0 || getComputedStyle(el).visibility === "hidden") return null;
  const offset = document.fullscreenElement || isStuck(el) ? 0 : scrollY;
  return { el, top: rect.top + offset, bottom: rect.bottom + offset, left: rect.left, right: rect.right };
}

// How far apart two ranges are (0 when they overlap)
const gap = (a1: number, a2: number, b1: number, b2: number) => Math.max(0, Math.max(a1, b1) - Math.min(a2, b2));
const overlaps = (a1: number, a2: number, b1: number, b2: number) => Math.min(a2, b2) - Math.max(a1, b1) > 1;
const middle = (a: number, b: number) => (a + b) / 2;

function boxes(current: Element | null) {
  // In full screen only what is shown counts (a video and its buttons), not the page behind
  const root = document.fullscreenElement ?? document;
  const all: Box[] = [];
  for (const el of root.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (el === current) continue;
    // Of a group of radio buttons the remote visits each one (it picks with OK)
    const box = boxOf(el);
    if (box) all.push(box);
  }
  return all;
}

function next(from: Box, { x, y }: Direction, current: Element | null): HTMLElement | null {
  const all = boxes(current);

  if (y !== 0) {
    // Only what starts below (or ends above) the current item
    const ahead = all.filter((b) => (y > 0 ? b.top >= from.bottom - 2 : b.bottom <= from.top + 2));
    if (ahead.length === 0) return null;
    const distance = (b: Box) => (y > 0 ? b.top - from.bottom : from.top - b.bottom);
    // The nearest row: the closest item, and everything level with it
    const closest = Math.min(...ahead.map(distance));
    const first = ahead
      .filter((b) => distance(b) <= closest + 2)
      .sort((a, b) => gap(a.left, a.right, from.left, from.right) - gap(b.left, b.right, from.left, from.right))[0]!;
    const row = ahead.filter((b) => overlaps(b.top, b.bottom, first.top, first.bottom));
    // In that row, the item most in line with the current one
    const centre = middle(from.left, from.right);
    row.sort(
      (a, b) =>
        gap(a.left, a.right, from.left, from.right) - gap(b.left, b.right, from.left, from.right) ||
        Math.abs(middle(a.left, a.right) - centre) - Math.abs(middle(b.left, b.right) - centre),
    );
    return row[0]!.el;
  }

  // Left / right: only the same row (level with the current item), the nearest one
  const row = all.filter(
    (b) => overlaps(b.top, b.bottom, from.top, from.bottom) && (x > 0 ? b.left >= from.right - 2 : b.right <= from.left + 2),
  );
  if (row.length === 0) return null;
  const centre = middle(from.top, from.bottom);
  row.sort(
    (a, b) =>
      (x > 0 ? a.left - b.left : b.right - a.right) ||
      Math.abs(middle(a.top, a.bottom) - centre) - Math.abs(middle(b.top, b.bottom) - centre),
  );
  return row[0]!.el;
}

// Boxes you type in. Reached with the arrows they wait, read-only, for OK: a TV would
// otherwise pop up its keyboard every time the selection merely passes over them.
const TEXT_TYPES = new Set(["text", "search", "email", "password", "url", "tel", "number"]);
function isTextBox(el: Element | null): el is HTMLInputElement | HTMLTextAreaElement {
  return el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && TEXT_TYPES.has(el.type));
}
const waitsForOk = (el: Element | null) => isTextBox(el) && el.dataset.tvWaiting === "1";

// Select a text box without starting to type in it
function selectTextBox(box: HTMLInputElement | HTMLTextAreaElement) {
  if (box.readOnly) return; // a box that is read-only anyway stays as it is
  box.readOnly = true;
  box.dataset.tvWaiting = "1";
  box.addEventListener("blur", () => startTyping(box), { once: true });
}
function startTyping(box: HTMLInputElement | HTMLTextAreaElement) {
  if (box.dataset.tvWaiting !== "1") return;
  box.readOnly = false;
  delete box.dataset.tvWaiting;
}

// Where the arrows keep their usual job: left/right move the cursor in a text box;
// up/down move between the lines of a long text until its first or last line.
// Everywhere else they move the selection.
function arrowsBelongTo(el: Element | null, key: string) {
  // A box only selected (not typing yet): the arrows move on in every direction
  if (waitsForOk(el)) return false;
  const sideways = key === "ArrowLeft" || key === "ArrowRight";
  if (el instanceof HTMLInputElement) {
    return sideways && !["checkbox", "radio", "button", "submit", "reset"].includes(el.type);
  }
  if (el instanceof HTMLTextAreaElement) {
    if (sideways) return true;
    const atStart = el.selectionStart === 0;
    const atEnd = el.selectionEnd === el.value.length;
    return key === "ArrowUp" ? !atStart : !atEnd;
  }
  return el instanceof HTMLElement && el.isContentEditable;
}

// Bring something to the middle of the screen. Anything in a video player brings the
// whole player (picture and buttons), so the video is never cut in half.
function bringIntoView(el: HTMLElement) {
  const shown = el instanceof HTMLInputElement && el.labels?.[0] ? el.labels[0] : el;
  const player = shown.closest<HTMLElement>(".media-box");
  (player ?? shown).scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
}

export default function SpatialNavigation() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
      const current = document.activeElement;

      // Back leaves full screen
      if (document.fullscreenElement && (BACK_KEYS.has(event.key) || BACK_KEY_CODES.has(event.keyCode))) {
        event.preventDefault();
        void document.exitFullscreen();
        return;
      }

      // OK on a selected text box starts typing: the TV's keyboard opens now
      if (event.key === "Enter" && waitsForOk(current)) {
        event.preventDefault();
        const box = current as HTMLInputElement | HTMLTextAreaElement;
        startTyping(box);
        // Focusing it again is what makes a TV show its keyboard
        box.blur();
        box.focus();
        return;
      }
      // A real keyboard: typing a letter in a selected box just types it
      if (waitsForOk(current) && event.key.length === 1) {
        startTyping(current as HTMLInputElement | HTMLTextAreaElement);
        return;
      }

      // OK on a star or a tick box picks it (on its own, Enter would send the form instead)
      if (
        event.key === "Enter" &&
        current instanceof HTMLInputElement &&
        (current.type === "radio" || current.type === "checkbox")
      ) {
        event.preventDefault();
        current.click();
        return;
      }

      const direction = DIRECTIONS[event.key as keyof typeof DIRECTIONS];
      if (!direction || event.shiftKey || arrowsBelongTo(current, event.key)) return;

      const box = current instanceof HTMLElement && current !== document.body ? boxOf(current) : null;
      // Nothing selected yet: start from the top (or bottom) of what is on screen
      const from: Box = box ?? {
        el: document.body,
        top: direction.y < 0 ? scrollY + innerHeight : scrollY,
        bottom: direction.y < 0 ? scrollY + innerHeight : scrollY,
        left: 0,
        right: innerWidth,
      };
      const target = next(from, direction, current);

      if (!target) {
        // Never let an arrow change a closed menu (e.g. the country) or a choice:
        // OK opens the menu, and picks a star
        if (current instanceof HTMLSelectElement || (current instanceof HTMLInputElement && current.type === "radio")) {
          event.preventDefault();
        }
        // Anywhere else (the very top or bottom of the page) the arrow scrolls as usual
        return;
      }

      event.preventDefault();
      if (isTextBox(target)) selectTextBox(target);
      target.focus({ preventScroll: true });
      // In the middle of the screen, so the navbar stuck at the top never hides it
      bringIntoView(target);
    }

    // "▶ Trailer" and "▶ Watch now" jump to a player (#trailer, #watch): show the whole
    // player in the middle of the screen and select it, instead of the browser's jump
    // that puts its heading at the top and cuts the video off at the bottom
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.("a[href^='#']");
      const id = link?.getAttribute("href")?.slice(1);
      const section = id ? document.getElementById(id) : null;
      const player = section?.querySelector<HTMLElement>(".media-box");
      if (!player) return;
      event.preventDefault();
      history.replaceState(null, "", `#${id}`);
      const first = player.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus({ preventScroll: true });
      player.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
