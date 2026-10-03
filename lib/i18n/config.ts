// Languages of the public site. Plain constants: safe for server, client,
// middleware and the seed script.

export const LOCALES = ["en", "fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

/** The language content is written in; the others are translations of it. */
export const DEFAULT_LOCALE = "en" satisfies Locale;

/** Languages content can be translated into in the CMS. */
export const TRANSLATION_LOCALES = ["fr", "ar"] as const;
export type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export const dirOf = (locale: Locale): "ltr" | "rtl" => (locale === "ar" ? "rtl" : "ltr");

/** Each language's own name, as shown in the language menu. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

/** The page for a language. English lives at the root. */
export const localeHref = (locale: Locale): string => (locale === DEFAULT_LOCALE ? "/" : `/${locale}`);

/**
 * Where the language menu links. "/" follows the browser's language, so English
 * goes through /en, which remembers the choice first (app/en/route.ts).
 */
export const switchHref = (locale: Locale): string => `/${locale}`;

/**
 * Locale for dates and plural rules. Arabic follows Lebanese usage: Levantine
 * month names with Western digits ("الاثنين، 5 تشرين الأول").
 */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  fr: "fr",
  ar: "ar-LB-u-nu-latn",
};

/**
 * Locale for numbers. Arabic text with Western digits writes "4.8" and
 * "1,234"; the Lebanese locale data would give "4,8" and "1.234".
 */
export const NUMBER_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  fr: "fr",
  ar: "ar-u-nu-latn",
};

/** Remembers a choice made in the language menu. A preference only; read by middleware.ts. */
export const LANG_COOKIE = "hmc_lang";
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
