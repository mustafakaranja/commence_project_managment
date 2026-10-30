import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/webhooks/razorpay"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Attach user info to headers for API routes
  const headers = new Headers(request.headers);
  headers.set("x-user-id", payload.userId);
  headers.set("x-user-role", payload.role);
  headers.set("x-user-name", payload.fullName);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
