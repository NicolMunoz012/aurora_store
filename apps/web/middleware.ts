// =============================================================================
// apps/web/middleware.ts — Admin route protection + sessionId cookie
// Protege /admin/* verificando rol ADMIN (Req 3.1–3.4, 6.2).
// =============================================================================

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // ── Admin route protection ─────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // No session → redirect to login (Req 3.2)
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Session exists but role is not ADMIN → 403 (Req 3.3)
    if (session.user?.role !== "ADMIN") {
      return new NextResponse(null, { status: 403 });
    }
  }

  // ── Anonymous session cookie ───────────────────────────────────────────────
  // Generate aurora_session_id for anonymous cart persistence (Req 6.2).
  const response = NextResponse.next();

  if (!req.cookies.get("aurora_session_id")) {
    response.cookies.set("aurora_session_id", uuidv4(), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
  }

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api/auth (Auth.js route handler)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
