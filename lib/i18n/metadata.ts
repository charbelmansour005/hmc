import type { Metadata, Viewport } from "next";
import { siteUrl } from "../site-url";
import { DEFAULT_LOCALE, LOCALES, localeHref, type Locale } from "./config";
import { getMessages } from "./messages";

const OG_IMAGE =
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&h=630&q=75";

const OG_LOCALE: Record<Locale, string> = { en: "en_US", fr: "fr_FR", ar: "ar_LB" };

export const siteViewport: Viewport = {
  // Dark is the default theme; ThemeToggle updates this when light is chosen.
  themeColor: "#0d151d",
};

/**
 * Title, description and social tags for the public page in one language,
 * plus the links that tell search engines the three pages are translations of
 * each other. Those need absolute URLs, so they are left out when the site's
 * address isn't configured (see siteUrl).
 */
export function siteMetadata(locale: Locale): Metadata {
  const t = getMessages(locale).meta;
  const base = siteUrl();
  return {
    title: t.title,
    description: t.description,
    openGraph: {
      type: "website",
      title: t.ogTitle,
      description: t.ogDescription,
      images: [OG_IMAGE],
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((other) => other !== locale).map((other) => OG_LOCALE[other]),
      ...(base ? { url: localeHref(locale) } : {}),
    },
    ...(base
      ? {
          metadataBase: new URL(base),
          alternates: {
            canonical: localeHref(locale),
            languages: {
              ...Object.fromEntries(LOCALES.map((other) => [other, localeHref(other)])),
              // "/" opens in the visitor's own language (middleware.ts).
              "x-default": localeHref(DEFAULT_LOCALE),
            },
          },
        }
      : {}),
  };
}
