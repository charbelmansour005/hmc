"use client";

import { createContext, useContext, useMemo } from "react";
import { dirOf, type Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages/en";

type I18n = { locale: Locale; dir: "ltr" | "rtl"; t: Messages };

const I18nContext = createContext<I18n | null>(null);

/**
 * Hands the page's language and wording to client components. The server
 * passes one language's dictionary, so the others never reach the browser.
 * (Server components get the same `t` as a prop instead.)
 */
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, dir: dirOf(locale), t: messages }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
