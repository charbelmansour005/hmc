import "server-only";
import { REVIEW_MIN_RATING } from "./categories";
import type { GoogleReviewDTO, GoogleReviewsDTO } from "./types";

// Reviews for the public site from the Google Places API (New), Place Details.
//
// Google's Places API policies shape this module:
// - No caching. Only Place IDs may be stored; every other field must be
//   fetched from Google when it is shown. Every call here goes to Google
//   (cache: "no-store"), and the section only asks for reviews once a
//   visitor scrolls near it, which keeps the billed calls down.
// - Google returns at most 5 reviews per place, picked "by relevance", and
//   has no newest-first option. We sort those by date and drop anything
//   under REVIEW_MIN_RATING. (Google's policy asks for a visible notice of
//   that ordering and filtering; the site leaves it out at the client's request.)
// - Attribution: each review keeps its author name, photo and profile link,
//   plus a link to the review on Google Maps.

const PLACE_DETAILS = "https://places.googleapis.com/v1/places/";
// Asking for `reviews` bills the "Place Details Enterprise + Atmosphere" SKU.
const FIELD_MASK = "rating,userRatingCount,googleMapsUri,googleMapsLinks,reviews";
const TIMEOUT_MS = 6000;

/** Server-only key; it never reaches the browser. */
export function googlePlacesKey(): string | null {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() || null;
}

type LocalizedText = { text?: string; languageCode?: string };

type PlaceReview = {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: LocalizedText;
  originalText?: LocalizedText;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  publishTime?: string;
  googleMapsUri?: string;
};

type Place = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  googleMapsLinks?: { reviewsUri?: string; writeAReviewUri?: string };
  reviews?: PlaceReview[];
};

/** Only https URLs from Google's response ever reach an href or src. */
function httpsUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

async function fetchPlace(placeId: string, key: string): Promise<Place> {
  const res = await fetch(`${PLACE_DETAILS}${encodeURIComponent(placeId)}?languageCode=en`, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELD_MASK },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { status?: string; message?: string } } | null;
    throw new Error(`HTTP ${res.status} ${body?.error?.status ?? ""} ${body?.error?.message ?? ""}`.trim());
  }
  return (await res.json()) as Place;
}

function toReview(review: PlaceReview): GoogleReviewDTO | null {
  const text = review.text?.text?.trim();
  const rating = review.rating ?? 0;
  if (!text || rating < REVIEW_MIN_RATING) return null;

  // Google translates reviews into the requested language; keep the author's
  // own words too, so visitors can switch (and we label the translation).
  const original = review.originalText?.text?.trim();
  const lang = review.text?.languageCode ?? null;
  const originalLang = review.originalText?.languageCode ?? null;
  const translated = Boolean(original && lang && originalLang && lang !== originalLang);

  return {
    id: review.name ?? `${review.authorAttribution?.displayName ?? ""}|${review.publishTime ?? ""}`,
    author: review.authorAttribution?.displayName?.trim() || "Google user",
    authorUrl: httpsUrl(review.authorAttribution?.uri),
    authorPhoto: httpsUrl(review.authorAttribution?.photoUri),
    rating,
    relativeTime: review.relativePublishTimeDescription ?? "",
    publishTime: review.publishTime ?? null,
    text,
    lang,
    original: translated && original ? { text: original, lang: originalLang } : null,
    url: httpsUrl(review.googleMapsUri),
  };
}

const publishedAt = (r: GoogleReviewDTO) => (r.publishTime ? Date.parse(r.publishTime) || 0 : 0);

/**
 * Live reviews for the configured places, newest first. Returns null when no
 * key or Place ID is configured; throws when every place fails to load.
 */
export async function getGoogleReviews(placeIds: string[]): Promise<GoogleReviewsDTO | null> {
  const key = googlePlacesKey();
  if (!key || placeIds.length === 0) return null;

  const results = await Promise.allSettled(placeIds.map((id) => fetchPlace(id, key)));
  const places: Place[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") places.push(result.value);
    else console.error(`[reviews] Google Places failed for ${placeIds[i]}:`, String(result.reason));
  });
  if (places.length === 0) throw new Error("No Google place could be loaded.");

  const byId = new Map<string, GoogleReviewDTO>();
  for (const place of places) {
    for (const raw of place.reviews ?? []) {
      const review = toReview(raw);
      if (review && !byId.has(review.id)) byId.set(review.id, review);
    }
  }

  const total = places.reduce((sum, p) => sum + (p.userRatingCount ?? 0), 0);
  const weighted = places.reduce((sum, p) => sum + (p.rating ?? 0) * (p.userRatingCount ?? 0), 0);
  const first = places[0];

  return {
    rating: total > 0 ? Math.round((weighted / total) * 10) / 10 : (first.rating ?? null),
    total,
    reviewsUrl: httpsUrl(first.googleMapsLinks?.reviewsUri) ?? httpsUrl(first.googleMapsUri),
    writeReviewUrl: httpsUrl(first.googleMapsLinks?.writeAReviewUri),
    reviews: [...byId.values()].sort((a, b) => publishedAt(b) - publishedAt(a)),
  };
}
