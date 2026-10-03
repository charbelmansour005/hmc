import { NextResponse, type NextRequest } from "next/server";
import { getGoogleReviews, googlePlacesKey } from "@/lib/google-reviews";
import { HttpError, rateLimited, withErrors } from "@/lib/http";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { clientKey, hitLimit } from "@/lib/ratelimit";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";

// Google's terms forbid caching Places content, so no browser or CDN may keep it.
const NO_STORE = { "Cache-Control": "private, no-store" };
const LIMIT = 20;
const WINDOW_SECONDS = 10 * 60;

// Public: the reviews section's data, fetched live from Google on every call.
// Google bills each call, hence the same-origin check and the rate limit.
export const GET = withErrors(async (req: NextRequest) => {
  // Browsers label cross-site requests; refuse them so another site can't
  // spend this site's Google quota through its visitors.
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") {
    throw new HttpError(403, "forbidden", "Cross-site request rejected.", undefined, NO_STORE);
  }

  const { googlePlaceIds } = await getSettings();
  if (!googlePlacesKey() || googlePlaceIds.length === 0) {
    return new NextResponse(null, { status: 204, headers: NO_STORE });
  }

  const limit = await hitLimit(`reviews:${clientKey(req)}`, LIMIT, WINDOW_SECONDS);
  if (!limit.allowed) throw rateLimited(limit.retryAfter, "Too many requests.");

  // The page's language (?lang=fr): Google translates the reviews into it.
  const lang = req.nextUrl.searchParams.get("lang");
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

  let reviews;
  try {
    reviews = await getGoogleReviews(googlePlaceIds, locale);
  } catch {
    throw new HttpError(502, "upstream_unavailable", "Reviews are unavailable right now.", undefined, NO_STORE);
  }
  if (!reviews) return new NextResponse(null, { status: 204, headers: NO_STORE });
  return NextResponse.json(reviews, { headers: NO_STORE });
});
