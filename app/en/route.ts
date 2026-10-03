import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, LANG_COOKIE_MAX_AGE } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

// The "English" link of the language menu. English lives at "/", but "/" opens
// in the browser's language (middleware.ts), so the choice has to be
// remembered before going there. This also works without JavaScript.
export function GET(req: NextRequest) {
  const home = req.nextUrl.clone();
  home.pathname = "/";
  const res = NextResponse.redirect(home, 307);
  res.cookies.set(LANG_COOKIE, "en", {
    path: "/",
    maxAge: LANG_COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: home.protocol === "https:",
  });
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}
