import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "invite_ok";

export function middleware(req: NextRequest) {
  const ok = req.cookies.get(COOKIE_NAME)?.value === "1";
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("e", "auth");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*"],
};
