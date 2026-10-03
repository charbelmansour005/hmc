import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, LOCALES, localeHref } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/site-url";

// The site is one page in three languages. Empty when the site's address is
// not configured, rather than listing localhost.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  if (!base) return [];
  const languages = Object.fromEntries(LOCALES.map((locale) => [locale, base + localeHref(locale)]));
  return LOCALES.map((locale) => ({
    url: base + localeHref(locale),
    changeFrequency: "weekly",
    priority: locale === DEFAULT_LOCALE ? 1 : 0.8,
    alternates: { languages },
  }));
}
