import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Token_Storage_Key } from "./utils/constants";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(Token_Storage_Key);

  const { pathname } = request.nextUrl;

  // Define paths
  const publicPaths = ["/", "/otp"];
  const isPublicPath = publicPaths.includes(pathname);
  const isComponents =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico");

  if (isComponents) {
    return NextResponse.next();
  }
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
