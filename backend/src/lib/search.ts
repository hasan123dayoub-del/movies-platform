// Puts the best matches for a search first, the way a TV guide does while you type:
//   0. the text starts with the search            "inc"  -> "Inception"
//   1. a later word starts with it                "dark" -> "The Dark Knight Rises"
//   2. it appears somewhere inside                "ark"  -> "The Dark Knight Rises"
// Items in the same group keep the order the database gave them (sort() is stable).
export function rankByMatch<T>(items: T[], search: string, textOf: (item: T) => string) {
  const query = search.toLowerCase();
  const rank = (item: T) => {
    const text = textOf(item).toLowerCase();
    if (text.startsWith(query)) return 0;
    if (text.split(/\s+/).some((word) => word.startsWith(query))) return 1;
    return 2;
  };
  return [...items].sort((a, b) => rank(a) - rank(b));
}
