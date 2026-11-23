import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Fast redirect for visitors without a session cookie. Real role checks happen in the UI guard AND on the Express server.
export function middleware(request) {
  if (!getSessionCookie(request)) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/services/:path+", "/salon", "/payment/:path*"] };
