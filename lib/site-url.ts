/**
 * The site's public origin without a trailing slash, for absolute links
 * (canonical, hreflang, sitemap): APP_URL, else the production domain Vercel
 * assigns. Null when neither is known, so nothing ever points at localhost.
 */
export function siteUrl(): string | null {
  const explicit = process.env.APP_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const raw = explicit || (vercel ? `https://${vercel}` : "");
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}
