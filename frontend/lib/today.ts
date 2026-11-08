import { cacheLife } from "next/cache";

// Today's date, worked out once a day.
// Pages are prerendered and cached, and `new Date()` changes on every call, so Next
// won't let a cached page read the clock directly. Caching the date itself for a day
// keeps the pages cached and the ages correct.
export async function getToday() {
  "use cache";
  cacheLife("days");
  return new Date().toISOString();
}
