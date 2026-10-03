import { Beiruti, Readex_Pro } from "next/font/google";
import { inter } from "./font-inter";

// The Arabic page's typefaces. Only the Arabic root layout imports this file,
// so only /ar downloads them. site.css puts them first in the font stacks of
// that page (:root[lang="ar"]), so Arabic text, and the digits and spaces
// inside it, all come from the same design.
//
// Headings: Beiruti, by the Lebanese foundry Boutros. Condensed and confident,
// drawn from Beirut's street lettering.
const display = Beiruti({
  subsets: ["arabic"],
  variable: "--font-arabic-display",
  display: "swap",
});

// Text: Readex Pro. Open, even and very readable at small sizes.
const text = Readex_Pro({
  subsets: ["arabic"],
  variable: "--font-arabic-text",
  display: "swap",
});

/**
 * Class names for the Arabic page: its two typefaces, plus Inter for the logo,
 * which is never translated. (Newsreader is not needed there, so this file
 * must not import ./fonts.)
 */
export const arabicPageFonts = `${inter.variable} ${display.variable} ${text.variable}`;
