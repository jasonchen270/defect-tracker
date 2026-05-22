import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight gate: redirect unauthenticated visitors to /login before they hit
// a protected page. This only checks for the presence of the NextAuth session
// cookie (cheap, Edge-safe); every page/action still re-verifies the session
// server-side via auth(), so this is a UX shortcut, not the security boundary.
const PUBLIC = ["/login", "/register"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.includes(pathname)) return NextResponse.next();

  const hasSession =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals, the auth API, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
