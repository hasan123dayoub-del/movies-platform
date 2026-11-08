// { search: "dark", sort: "newest" } -> "?search=dark&sort=newest" (empty values left out)
export function toQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}
