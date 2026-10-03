import "../site.css";
import { SiteDocument } from "../SiteDocument";
import { arabicPageFonts } from "@/app/fonts-arabic";
import { siteMetadata, siteViewport } from "@/lib/i18n/metadata";

// Arabic, at /ar: right-to-left, with the Arabic typefaces (only this layout
// imports them, so only this page preloads them). See ../(en)/layout.tsx.
export const generateMetadata = () => siteMetadata("ar");
export const viewport = siteViewport;

export default function ArabicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteDocument locale="ar" fonts={arabicPageFonts}>
      {children}
    </SiteDocument>
  );
}
