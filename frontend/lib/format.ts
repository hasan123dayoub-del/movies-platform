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

// Full years between the birthday and today
export function getAge(birthday: string) {
  const born = new Date(birthday);
  const today = new Date();
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
