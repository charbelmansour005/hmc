"use client";

import { dirOf, TRANSLATION_LOCALES, type TranslationLocale } from "@/lib/i18n/config";
import type { Translations } from "@/lib/types";
import { Card, inputClass, LANGUAGE } from "./ui";

/** One translatable field of a form. `english` is the text it translates, shown as the placeholder. */
export type TranslationField = {
  key: string;
  label: string;
  english: string;
  maxLength?: number;
  multiline?: boolean;
};

/** What the inputs hold, per language and field key: "" means "not translated". */
export type TranslationValues = Translations<Record<string, string>>;

/** Form state for a translations card from an item's stored translations (null/missing -> ""). */
export function translationValues(
  translations: Translations<Record<string, string | string[] | null>> | undefined,
  keys: string[],
): TranslationValues {
  return Object.fromEntries(
    TRANSLATION_LOCALES.map((locale) => [
      locale,
      Object.fromEntries(
        keys.map((key) => {
          const value = translations?.[locale][key];
          return [key, Array.isArray(value) ? value.join(locale === "ar" ? "، " : ", ") : (value ?? "")];
        }),
      ),
    ]),
  ) as TranslationValues;
}

/** A comma-separated list as typed in either script ("," or the Arabic "،"). */
export const splitList = (value: string) =>
  value
    .split(/[,،]/)
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * The French and Arabic versions of a form's text: one row per field, one
 * column per language. An empty field is fine: the site shows the English
 * text there.
 */
export function TranslationsCard({
  fields,
  values,
  onChange,
  error,
}: {
  fields: TranslationField[];
  values: TranslationValues;
  onChange: (locale: TranslationLocale, key: string, value: string) => void;
  /** The server's message for a field path such as "translations.fr.name". */
  error: (path: string) => string | undefined;
}) {
  return (
    <Card className="grid gap-5">
      <div>
        <h2 className="text-lg text-ink">Translations</h2>
        <p className="mt-1 text-sm text-muted">
          The same text for the French and Arabic pages. Leave a field empty to show the English there.
        </p>
      </div>
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        {TRANSLATION_LOCALES.map((locale) => (
          <p key={locale} className="hidden text-sm font-semibold text-ink-2 sm:block">
            {LANGUAGE[locale]}
          </p>
        ))}
        {fields.map((field) => (
          <fieldset key={field.key} className="grid gap-x-4 gap-y-2 sm:col-span-2 sm:grid-cols-2">
            <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{field.label}</legend>
            {TRANSLATION_LOCALES.map((locale) => {
              const id = `translation-${locale}-${field.key}`;
              const message = error(`translations.${locale}.${field.key}`);
              const props = {
                id,
                className: inputClass,
                lang: locale,
                dir: dirOf(locale),
                value: values[locale][field.key] ?? "",
                maxLength: field.maxLength,
                placeholder: field.english,
                "aria-label": `${field.label} in ${LANGUAGE[locale]}`,
                "aria-invalid": Boolean(message),
                "aria-describedby": message ? `${id}-error` : undefined,
              };
              return (
                <div key={locale} className="grid content-start gap-1.5">
                  <span className="text-xs text-muted sm:hidden">{LANGUAGE[locale]}</span>
                  {field.multiline ? (
                    <textarea rows={2} {...props} onChange={(e) => onChange(locale, field.key, e.target.value)} />
                  ) : (
                    <input {...props} onChange={(e) => onChange(locale, field.key, e.target.value)} />
                  )}
                  {message ? (
                    <p className="text-xs font-medium text-danger" id={`${id}-error`}>
                      {message}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </fieldset>
        ))}
      </div>
    </Card>
  );
}
