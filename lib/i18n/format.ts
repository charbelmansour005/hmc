// Small text helpers for the dictionaries in ./messages. No dependencies:
// safe for server and client.
import { INTL_LOCALE, NUMBER_LOCALE, type Locale } from "./config";

/**
 * The wordings of a counted phrase. English and French only need `one` and
 * `other`; Arabic uses all six ("خدمتان" for two, "3 خدمات", "11 خدمة" …).
 */
export type Plural = {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

/** Fills "{name}" placeholders; unknown ones are left as they are. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], options).format(value);
}

const rules = new Map<Locale, Intl.PluralRules>();

/** The wording for `n` in this language, placeholders still unfilled. */
export function pluralForm(locale: Locale, n: number, forms: Plural): string {
  let rule = rules.get(locale);
  if (!rule) rules.set(locale, (rule = new Intl.PluralRules(INTL_LOCALE[locale])));
  return forms[rule.select(n)] ?? forms.other;
}

/** A counted phrase with "{n}" (and any other placeholders) filled in. */
export function plural(
  locale: Locale,
  n: number,
  forms: Plural,
  values: Record<string, string | number> = {},
): string {
  return fmt(pluralForm(locale, n, forms), { n: formatNumber(locale, n), ...values });
}

/**
 * Wraps text that must always read left to right (a phone number) in Unicode
 * isolates, so it keeps its order inside an Arabic sentence. For plain strings;
 * in markup use <bdi dir="ltr"> instead.
 */
export const ltr = (text: string): string => `\u2066${text}\u2069`;
