import * as motion from "motion/react-client";
import { telHref } from "@/lib/home-content";
import { fmt } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages/en";
import type { NavLink, PublicSettings } from "@/lib/types";
import { HmcLogo } from "./HmcLogo";
import { LanguageLinks } from "./LanguageSwitcher";
import { fadeUp, VIEWPORT } from "./motion/variants";

export function SiteFooter({ nav, settings, t }: { nav: NavLink[]; settings: PublicSettings; t: Messages }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <motion.div className="footer-card" initial="hidden" whileInView="show" viewport={VIEWPORT} variants={fadeUp}>
          <div className="footer-brand">
            <h2>
              <HmcLogo id="footer-logo" />
            </h2>
            <p>{t.footer.tagline}</p>
          </div>
          <ul className="footer-links">
            {nav
              .filter((link) => link.href !== "#visit")
              .map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
          </ul>
          <address className="footer-contact">
            <a href={telHref(settings.phone)} dir="ltr">
              {settings.phone}
            </a>
            <span>{settings.address ?? t.sections.addressPlaceholder}</span>
          </address>
        </motion.div>
        <div className="footer-bottom">
          <p className="copyright">{fmt(t.footer.rights, { year: new Date().getFullYear() })}</p>
          <LanguageLinks className="footer-languages" />
          <p className="credit">{fmt(t.footer.credit, { studio: "Runtime Collective" })}</p>
        </div>
      </div>
    </footer>
  );
}
