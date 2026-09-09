import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminRole } from "@/lib/roles";

export default async function proxy(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET?.trim();

  if (!secret) {
    return NextResponse.redirect(
      new URL("/login?error=configuration", request.url),
    );
  }

  const token = await getToken({ req: request, secret });

  if (!isAdminRole(token?.role)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
