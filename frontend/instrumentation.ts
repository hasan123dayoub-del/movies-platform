// Runs once when the Next.js server starts. On the free hosting plan both the website
// and the API sleep when idle, and a visitor wakes the website first. Pinging the API
// right away starts waking it in parallel, so the first page doesn't wait for two
// wake-ups in a row. Not awaited: the website must not wait for it to start.
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.API_URL) {
    return;
  }
  fetch(`${process.env.API_URL}/health`).catch(() => {
    // The page requests retry while the API wakes; nothing to do here
  });
}
