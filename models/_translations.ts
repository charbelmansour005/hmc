import { Schema, type SchemaDefinition } from "mongoose";
import { TRANSLATION_LOCALES, type TranslationLocale } from "../lib/i18n/config";

/** One translated copy per language, as stored. Anything may be missing: see lib/dto.ts. */
export type StoredTranslations<T> = Partial<Record<TranslationLocale, Partial<T> | null>> | null;

/** An optional translated string: null means "not translated, show the English". */
export const translated = (maxlength: number) => ({ type: String, default: null, trim: true, maxlength });

/**
 * The `translations` field of a content model: a copy of its text fields for
 * each language in TRANSLATION_LOCALES, all optional. The English fields stay
 * where they were, so documents written before this existed need no migration:
 * they simply have no translations.
 */
export function translationsField(fields: SchemaDefinition) {
  const copy = new Schema(fields, { _id: false });
  const byLocale = new Schema(
    Object.fromEntries(TRANSLATION_LOCALES.map((locale) => [locale, { type: copy, default: () => ({}) }])),
    { _id: false },
  );
  return { type: byLocale, default: () => ({}) };
}
