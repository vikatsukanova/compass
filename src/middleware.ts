import { isPublicDemoDeployment, unsignedVisitorRedirect } from "@/lib/demo-profile";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const { pathname, search } = req.nextUrl;

  if (!token) {
    const destination = unsignedVisitorRedirect(pathname, search, isPublicDemoDeployment());
    if (destination) {
      return NextResponse.redirect(new URL(destination, req.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/login" || pathname === "/demo/enter") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
