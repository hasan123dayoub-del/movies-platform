import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./session-cookie";

// The login token from the API lives in a cookie on THIS site (the Next.js server).
// httpOnly: JavaScript in the browser can't read it, so an XSS bug can't steal it.
// The browser sends it back with every request; our server code reads it and
// forwards it to the API as "Authorization: Bearer <token>".

const COOKIE_NAME = SESSION_COOKIE;
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // same 7 days as the token itself

export async function getSessionToken() {
  return (await cookies()).get(COOKIE_NAME)?.value ?? null;
}

// Only callable from Server Actions (cookies can't change while a page is rendering)
export async function saveSession(token: string) {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    // HTTPS only in production; plain http://localhost works in development
    secure: process.env.NODE_ENV === "production",
    // Sent when following a link to the site, never by forms on other sites (CSRF)
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE_NAME);
}
