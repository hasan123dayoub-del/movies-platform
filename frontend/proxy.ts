import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

// Runs before /admin, /watchlist and /account pages render (like a route middleware in Laravel).
// A quick first check only: no session cookie means not logged in, so go to the login
// page and come back here afterwards. Whether the user is really an admin is checked
// by the admin layout, and again by the API on every change.
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/watchlist", "/account"],
};
