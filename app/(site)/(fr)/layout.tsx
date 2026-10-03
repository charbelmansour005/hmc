import "../site.css";
import { SiteDocument } from "../SiteDocument";
import { latinFonts } from "@/app/fonts";
import { siteMetadata, siteViewport } from "@/lib/i18n/metadata";

// French, at /fr. See the note in ../(en)/layout.tsx.
export const generateMetadata = () => siteMetadata("fr");
export const viewport = siteViewport;

export default function FrenchLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteDocument locale="fr" fonts={latinFonts}>
      {children}
    </SiteDocument>
  );
}
