import "../site.css";
import { SiteDocument } from "../SiteDocument";
import { latinFonts } from "@/app/fonts";
import { siteMetadata, siteViewport } from "@/lib/i18n/metadata";

// Each language is its own root layout, because <html lang dir> has to be
// right in the server's HTML: this one is English at "/", and (fr) and (ar)
// hold /fr and /ar. The shared shell is ../SiteDocument.tsx.
export const generateMetadata = () => siteMetadata("en");
export const viewport = siteViewport;

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteDocument locale="en" fonts={latinFonts}>
      {children}
    </SiteDocument>
  );
}
