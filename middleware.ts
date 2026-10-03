import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "./lib/auth/jwt";
import { DEFAULT_LOCALE, isLocale, LANG_COOKIE, localeHref } from "./lib/i18n/config";
import { matchAcceptLanguage } from "./lib/i18n/negotiate";

/**
 * "/" in the visitor's language: the one they picked in the language menu
 * (cookie), else the best match for their browser's languages. English is
 * served here; French and Arabic are redirected to /fr and /ar. The target
 * always comes from our own list, never from the cookie or header text.
 */
function homeInVisitorLanguage(req: NextRequest) {
  const picked = req.cookies.get(LANG_COOKIE)?.value;
  const locale = isLocale(picked) ? picked : matchAcceptLanguage(req.headers.get("accept-language"));

  if (locale === DEFAULT_LOCALE) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = localeHref(locale);
  const res = NextResponse.redirect(url, 307);
  // The answer depends on the visitor, so no cache may reuse it for someone else.
  // (The English page itself is rendered per request and already "no-store".)
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

// For /admin this is redirect UX only — NOT an authorization boundary
// (cf. CVE-2025-29927). Every CMS page calls requireAdmin() and every admin
// route handler calls requireAdminApi(); those checks are what protect the data.
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/") return homeInVisitorLanguage(req);
  if (pathname === "/admin/login") return NextResponse.next();

  const claims = await verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
  if (claims) return NextResponse.next();

  const login = new URL("/admin/login", req.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

// Must be a static literal: a computed matcher is silently ignored.
// /api is deliberately not matched; admin route handlers answer 401 themselves.
export const config = {
  matcher: ["/", "/admin/:path*"],
};
