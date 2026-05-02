import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Allow login page
  if (pathname === "/admin/login") return NextResponse.next();

  // Check for auth cookie
  const authToken = request.cookies.get("admin_auth")?.value;
  if (authToken !== "authenticated") {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
