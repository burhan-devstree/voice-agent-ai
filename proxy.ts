import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("devstree-voice-chat-token");
  const { pathname } = request.nextUrl;

  // Define paths
  const publicPaths = ["/login", "/otp"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isComponents =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico");

  if (isComponents) {
    return NextResponse.next();
  }

  // Redirect to dashboard if authenticated and trying to access public paths (like login)
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect to dashboard if authenticated and at root
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect to login if not authenticated and trying to access protected paths
  // Assuming everything NOT public is protected, except root which redirects to login if no token
  if (!token && !isPublicPath) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Allow public assets if any, but generally redirect
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
