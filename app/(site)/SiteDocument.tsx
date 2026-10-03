import { ThemeScript } from "@/components/ThemeScript";
import { dirOf, type Locale } from "@/lib/i18n/config";

/**
 * The <html> shell of the public site in one language. `lang` and `dir` have
 * to be right in the server's HTML (search engines, screen readers, no flash
 * of a left-to-right page in Arabic), so each language has its own root layout
 * ((en), (fr), (ar) beside this file) and they all render this.
 */
export function SiteDocument({
  locale,
  fonts,
  children,
}: {
  locale: Locale;
  /** Font variable class names (app/fonts.ts, or app/fonts-arabic.ts for Arabic). */
  fonts: string;
  children: React.ReactNode;
}) {
  return (
    // The inline script may switch data-theme before hydration, hence suppressHydrationWarning.
    <html lang={locale} dir={dirOf(locale)} data-theme="dark" className={fonts} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
