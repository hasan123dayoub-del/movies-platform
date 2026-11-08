// Small helpers used by more than one page

// "The Wolf of Wall Street" -> "WW", "Leonardo DiCaprio" -> "LD"
export function getInitials(text: string) {
  const skip = ["the", "a", "an", "of"];
  return text
    .split(" ")
    .filter((word) => !skip.includes(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

// "1974-11-11T00:00:00.000Z" -> "November 11, 1974"
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  });
}

// Full years between the birthday and `today` (from getToday(), see below)
export function getAge(birthday: string, todayIso: string) {
  const born = new Date(birthday);
  const today = new Date(todayIso);
  let age = today.getUTCFullYear() - born.getUTCFullYear();
  const hadBirthday =
    today.getUTCMonth() > born.getUTCMonth() ||
    (today.getUTCMonth() === born.getUTCMonth() &&
      today.getUTCDate() >= born.getUTCDate());
  if (!hadBirthday) {
    age--;
  }
  return age;
}

// A series' years: "2008 – 2013", "2019" (one year), or "2016 – present" (still running)
export function formatYears(startYear: number, endYear: number | null) {
  if (endYear === null) return `${startYear} – present`;
  return endYear === startYear ? String(startYear) : `${startYear} – ${endYear}`;
}

// 58 -> "58 min", 135 -> "2h 15m"
export function formatRuntime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  return rest ? `${Math.floor(minutes / 60)}h ${rest}m` : `${minutes / 60}h`;
}

// "2 seasons", "1 episode"
export function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
