import type { Metadata, Viewport } from "next";
import "./admin.css";
import { latinFonts } from "@/app/fonts";
import { ThemeScript } from "@/components/ThemeScript";

export const metadata: Metadata = {
  title: { default: "CMS · Hajj Medical Center", template: "%s · HMC CMS" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  // Dark is the default theme; ThemeToggle updates this when light is chosen.
  themeColor: "#0d151d",
};

// The CMS's own root layout (the public site has one per language, see
// app/(site)). The CMS is in English only. This layout is NOT an authorization
// boundary: every CMS page calls requireAdmin() itself.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // The inline script may switch data-theme before hydration, hence suppressHydrationWarning.
    <html lang="en" data-theme="dark" className={latinFonts} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
