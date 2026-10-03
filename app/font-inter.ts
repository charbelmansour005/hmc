import { Inter } from "next/font/google";

// In a file of its own: a page preloads every font declared in the modules its
// layout imports, and the Arabic page needs Inter (for the logo) but not
// Newsreader. See fonts.ts and fonts-arabic.ts.
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
