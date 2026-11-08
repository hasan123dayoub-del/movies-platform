import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getMe } from "./api";
import { getSessionToken } from "./session";

// The one place that answers "who is visiting?" (the Data Access Layer).
// cache(): however many components ask during one request, the API is called once.
export const getCurrentUser = cache(async () => {
  const token = await getSessionToken();
  return token ? getMe(token) : null;
});

// For Server Actions that change data. A Server Action is a public endpoint that anyone
// can call, so it checks the user itself instead of trusting the page that showed the form.
// (The API checks again: it is the real gatekeeper.)
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can do this");
  }
  return user;
}

// Only a path on this site, so ?next=https://evil.com can't send people elsewhere
export function safeNextPath(next: unknown) {
  // "//evil.com" and "/\evil.com" both mean another site to a browser
  return typeof next === "string" && /^\/(?![/\\])/.test(next) ? next : "/";
}
