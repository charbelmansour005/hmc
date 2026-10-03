import { Newsreader } from "next/font/google";
import { inter } from "./font-inter";

// The opsz axis keeps `font-optical-sizing: auto` working on the big headings.
const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

/** Class names that set --font-inter and --font-newsreader (used by theme.css). */
export const latinFonts = `${inter.variable} ${newsreader.variable}`;
