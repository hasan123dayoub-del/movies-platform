// Scroll a video player (picture and buttons) to the middle of the space below the
// navbar. The browser's own "centre it" ignores the navbar stuck at the top, so on a
// TV's short window the top of the picture ended up hidden under it. The navbar is
// measured each time, since a TV browser may show it bigger than a computer does.
// When the player is taller than that space, its top goes right under the navbar.
export function showPlayer(player: HTMLElement) {
  const navbar = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
  const box = player.getBoundingClientRect();
  const room = window.innerHeight - navbar;
  const gap = Math.max(0, (room - box.height) / 2);
  window.scrollTo({ top: window.scrollY + box.top - navbar - gap, behavior: "smooth" });
}
