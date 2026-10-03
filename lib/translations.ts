// Shared by the data layer and the seed script (no "server-only" here).
import { TRANSLATION_LOCALES, type TranslationLocale } from "./i18n/config";
import type { Translations } from "./types";

/**
 * The translations to store after a save: a language present in the request
 * replaces that language's stored copy as a whole; the others are kept.
 */
export function mergeTranslations<T>(
  current: Translations<T>,
  patch: Partial<Record<TranslationLocale, T>> | undefined,
): Translations<T> {
  return Object.fromEntries(
    TRANSLATION_LOCALES.map((locale) => [locale, patch?.[locale] ?? current[locale]]),
  ) as Translations<T>;
}

/** Applies `change` to every language's copy. */
export function mapTranslations<T>(translations: Translations<T>, change: (copy: T) => T): Translations<T> {
  return Object.fromEntries(
    TRANSLATION_LOCALES.map((locale) => [locale, change(translations[locale])]),
  ) as Translations<T>;
}
