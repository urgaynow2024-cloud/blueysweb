import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Skip middleware for admin, API routes, and static files
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(`${request.nextUrl.origin}/api/maintenance`);
    const data = await res.json();
    
    if (data.enabled) {
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }
  } catch {
    // If we can't check maintenance mode, allow the request through
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
